import React, { useState, useRef, useCallback, useMemo } from 'react'
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  ActionSheetIOS,
  Platform,
  Image,
} from 'react-native'
import { Stack } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import * as ImagePicker from 'expo-image-picker'
import { usePets } from '@/contexts/PetContext'
import * as api from '@/lib/api'
import { ChatMessage, LogEntry, Pet } from '@/lib/types'
import { generateId, daysSince } from '@/lib/utils'
import { colors, shadow, shadowMd } from '@/lib/theme'
import { hapticTap, hapticSuccess } from '@/lib/haptics'

// ─── Health Alert Logic ─────────────────────────────────────────────────────

interface HealthAlert {
  key: string
  label: string
  urgency: 'soon' | 'overdue'
  message: string
}

function getHealthAlerts(pet: Pet, logs: LogEntry[]): HealthAlert[] {
  const alerts: HealthAlert[] = []
  const lastLog = (type: string) =>
    logs
      .filter((l) => l.type === type)
      .sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      )[0]

  const check = (
    enabled: boolean,
    type: string,
    label: string,
    cycleDays: number,
    soonDays: number,
  ) => {
    if (!enabled) return
    const last = lastLog(type)
    const age = last ? daysSince(last.date) : Infinity
    if (age > cycleDays) {
      alerts.push({
        key: type,
        label,
        urgency: 'overdue',
        message: last ? `${age - cycleDays} days overdue` : 'No record yet',
      })
    } else if (age > soonDays) {
      alerts.push({
        key: type,
        label,
        urgency: 'soon',
        message: `Due in ${cycleDays - age} days`,
      })
    }
  }

  check(
    pet.trackingConfig.vaccinations,
    'vaccination',
    'Vaccination',
    365,
    300,
  )
  check(pet.trackingConfig.deworming, 'deworming', 'Deworming', 90, 75)
  check(pet.trackingConfig.fleaTick, 'flea_tick', 'Flea & Tick', 30, 25)
  check(pet.trackingConfig.weight, 'weight', 'Weight Check', 30, 25)

  return alerts
}

function getGreeting(): string {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  if (h < 21) return 'Good evening'
  return 'Good night'
}

// ─── Main Screen ────────────────────────────────────────────────────────────

export default function ChatPage() {
  const {
    activePet,
    pets,
    addLog,
    updatePet,
    isLoaded,
    getLogsFor,
    setActivePet,
  } = usePets()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef<ScrollView>(null)
  const searchBarRef = useRef<any>(null)

  const logs = useMemo(
    () => (activePet ? getLogsFor(activePet.id) : []),
    [activePet, getLogsFor],
  )

  const alerts = useMemo(
    () => (activePet ? getHealthAlerts(activePet, logs) : []),
    [activePet, logs],
  )

  const scrollToBottom = useCallback(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100)
  }, [])

  const sendMessage = useCallback(
    async (text?: string, imageUri?: string, s3Key?: string) => {
      if (!activePet) return
      if (!text && !s3Key) return

      const userMsg: ChatMessage = {
        id: generateId(),
        role: 'user',
        content: text || (imageUri ? 'Sent a photo' : ''),
        imageUri,
        timestamp: new Date().toISOString(),
      }

      setMessages((prev) => [...prev, userMsg])
      setInput('')
      setLoading(true)
      scrollToBottom()

      try {
        const resp = await api.chat(activePet.id, text, s3Key)
        const assistantMsg: ChatMessage = {
          id: generateId(),
          role: 'assistant',
          content: resp.reply,
          suggestedLogs: resp.suggestedLogs,
          petUpdates: resp.petUpdates,
          timestamp: new Date().toISOString(),
        }
        setMessages((prev) => [...prev, assistantMsg])
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            id: generateId(),
            role: 'assistant',
            content:
              'Sorry, I had trouble processing that. Please try again.',
            timestamp: new Date().toISOString(),
          },
        ])
      } finally {
        setLoading(false)
        scrollToBottom()
      }
    },
    [activePet, scrollToBottom],
  )

  const handlePhoto = useCallback(async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    })
    if (result.canceled || !result.assets[0]) return
    const asset = result.assets[0]
    try {
      const { url, s3Key } = await api.getUploadUrl(
        asset.mimeType || 'image/jpeg',
      )
      const blob = await fetch(asset.uri).then((r) => r.blob())
      await fetch(url, {
        method: 'PUT',
        body: blob,
        headers: { 'Content-Type': asset.mimeType || 'image/jpeg' },
      })
      sendMessage(input.trim() || undefined, asset.uri, s3Key)
    } catch (err) {
      console.error('[Chat] Upload failed:', err)
    }
  }, [input, sendMessage])

  const handleSaveLog = useCallback(
    (logData: Partial<LogEntry>) => {
      if (!activePet) return
      hapticSuccess()
      addLog({
        id: generateId(),
        petId: activePet.id,
        type: logData.type || 'note',
        date: logData.date || new Date().toISOString().slice(0, 10),
        title: logData.title || 'Log entry',
        notes: logData.notes,
        data: logData.data,
        createdAt: new Date().toISOString(),
      })
    },
    [activePet, addLog],
  )

  const handleUpdatePet = useCallback(
    (updates: Partial<Pet>) => {
      if (!activePet) return
      hapticSuccess()
      updatePet({
        ...activePet,
        ...updates,
        id: activePet.id,
        createdAt: activePet.createdAt,
        trackingConfig: activePet.trackingConfig,
      })
    },
    [activePet, updatePet],
  )

  if (!isLoaded) {
    return (
      <View className="flex-1 items-center justify-center bg-bg">
        <ActivityIndicator size="large" color={colors.fg} />
      </View>
    )
  }

  if (!activePet) return null

  const hasMessages = messages.length > 0

  const handlePetSwitch = () => {
    if (pets.length <= 1) return
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: [...pets.map((p) => p.name), 'Cancel'],
          cancelButtonIndex: pets.length,
        },
        (index) => {
          if (index < pets.length) {
            hapticTap()
            setActivePet(pets[index])
          }
        },
      )
    }
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: activePet.name,
          headerLargeTitle: true,
          headerLargeTitleStyle: { color: colors.fg },
          headerStyle: { backgroundColor: colors.bg },
          headerSearchBarOptions: {
            ref: searchBarRef,
            placeholder: `Tell me about ${activePet.name}...`,
            onChangeText: (e: any) => setInput(e.nativeEvent.text),
            onSearchButtonPress: (e: any) => {
              const text = e.nativeEvent?.text || input
              if (text?.trim()) {
                hapticTap()
                sendMessage(text.trim())
                searchBarRef.current?.clearText()
                searchBarRef.current?.blur()
              }
            },
            hideWhenScrolling: false,
            tintColor: colors.accent,
          },
          headerRight: () => (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
              <Pressable onPress={handlePhoto}>
                <Ionicons name="camera" size={22} color={colors.accent} />
              </Pressable>
              {pets.length > 1 && (
                <Pressable onPress={handlePetSwitch}>
                  <Ionicons name="swap-horizontal" size={22} color={colors.fg} />
                </Pressable>
              )}
            </View>
          ),
        }}
      />

      <ScrollView
        ref={scrollRef}
        className="flex-1 bg-bg"
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 16,
          paddingBottom: 100,
        }}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => {
          if (hasMessages)
            scrollRef.current?.scrollToEnd({ animated: false })
        }}
        keyboardShouldPersistTaps="handled"
      >
        {!hasMessages ? (
          <WelcomeView
            pet={activePet}
            alerts={alerts}
            onSuggestion={sendMessage}
          />
        ) : (
          messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              onSaveLog={handleSaveLog}
              onUpdatePet={handleUpdatePet}
            />
          ))
        )}

        {loading && (
          <View className="flex-row items-center gap-2.5 px-1 py-3">
            <View
              className="w-8 h-8 rounded-xl bg-surface items-center justify-center"
              style={shadow}
            >
              <ActivityIndicator size="small" color={colors.accent} />
            </View>
            <Text className="text-[13px] text-muted">Thinking...</Text>
          </View>
        )}

        {/* Quick Chips */}
        {hasMessages && !loading && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingTop: 8, gap: 6 }}
          >
            {['Log weight', 'Vet visit', 'Symptom', 'Add note'].map(
              (label) => (
                <Pressable
                  key={label}
                  onPress={() => {
                    hapticTap()
                    sendMessage(label)
                  }}
                  style={({ pressed }) => ({
                    opacity: pressed ? 0.7 : 1,
                  })}
                >
                  <View
                    className="px-3.5 py-2 rounded-full bg-surface border border-fg/[0.06]"
                    style={shadow}
                  >
                    <Text className="text-[12px] font-medium text-fg">
                      {label}
                    </Text>
                  </View>
                </Pressable>
              ),
            )}
          </ScrollView>
        )}
      </ScrollView>
    </>
  )
}

// ─── Welcome View ───────────────────────────────────────────────────────────

function WelcomeView({
  pet,
  alerts,
  onSuggestion,
}: {
  pet: Pet
  alerts: HealthAlert[]
  onSuggestion: (text: string) => void
}) {
  const greeting = getGreeting()
  const overdue = alerts.filter((a) => a.urgency === 'overdue')
  const soon = alerts.filter((a) => a.urgency === 'soon')

  return (
    <View className="gap-4">
      {/* AI Greeting */}
      <View className="items-start">
        <View className="flex-row items-center gap-2 mb-2 px-1">
          <View
            className="w-7 h-7 rounded-lg bg-accent items-center justify-center"
          >
            <Text className="text-[12px] font-bold text-white">P</Text>
          </View>
          <Text className="text-[12px] font-semibold text-muted">
            PawTrack AI
          </Text>
        </View>

        <View
          className="bg-surface rounded-2xl p-5 w-full"
          style={shadowMd}
        >
          <Text className="text-[16px] text-fg leading-[23px]">
            {greeting}! I'm here to help track{' '}
            <Text className="font-bold">{pet.name}</Text>'s health.{'\n\n'}
            Just tell me what happened — a vet visit, a weigh-in, a symptom —
            and I'll log it for you.
          </Text>

          {/* Health Alerts */}
          {(overdue.length > 0 || soon.length > 0) && (
            <View className="mt-5 gap-2">
              <Text className="text-xs font-semibold uppercase tracking-wider text-muted">
                Heads up
              </Text>

              {overdue.map((alert) => (
                <Pressable
                  key={alert.key}
                  onPress={() =>
                    onSuggestion(
                      `Log ${alert.label.toLowerCase()} for ${pet.name}`,
                    )
                  }
                  style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
                >
                  <View
                    className="flex-row items-center gap-3 px-3.5 py-3 rounded-xl"
                    style={{ backgroundColor: colors.accent + '10' }}
                  >
                    <View
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: colors.accent }}
                    />
                    <Text className="text-[13px] text-fg flex-1 leading-[18px]">
                      <Text className="font-semibold">{alert.label}</Text>
                      {' \u2014 '}
                      {alert.message}
                    </Text>
                    <Ionicons
                      name="chevron-forward"
                      size={14}
                      color={colors.muted}
                    />
                  </View>
                </Pressable>
              ))}

              {soon.map((alert) => (
                <Pressable
                  key={alert.key}
                  onPress={() =>
                    onSuggestion(
                      `Log ${alert.label.toLowerCase()} for ${pet.name}`,
                    )
                  }
                  style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
                >
                  <View
                    className="flex-row items-center gap-3 px-3.5 py-3 rounded-xl"
                    style={{ backgroundColor: colors.yellow + '15' }}
                  >
                    <View
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: colors.yellow }}
                    />
                    <Text className="text-[13px] text-fg flex-1 leading-[18px]">
                      <Text className="font-semibold">{alert.label}</Text>
                      {' \u2014 '}
                      {alert.message}
                    </Text>
                    <Ionicons
                      name="chevron-forward"
                      size={14}
                      color={colors.muted}
                    />
                  </View>
                </Pressable>
              ))}
            </View>
          )}

          {overdue.length === 0 && soon.length === 0 && (
            <View
              className="mt-4 flex-row items-center gap-2.5 px-3.5 py-3 rounded-xl"
              style={{ backgroundColor: colors.green + '10' }}
            >
              <Ionicons
                name="checkmark-circle"
                size={18}
                color={colors.green}
              />
              <Text className="text-[13px] text-fg font-medium">
                {pet.name} is all caught up on health tracking!
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Suggestions */}
      <View className="gap-2.5 mt-2">
        <Text className="text-xs font-semibold uppercase tracking-wider text-muted px-1">
          Try saying
        </Text>
        <SuggestionChip
          text={`${pet.name} weighed 4.5kg today`}
          onPress={onSuggestion}
        />
        <SuggestionChip
          text="We got a vaccination at the vet"
          onPress={onSuggestion}
        />
        <SuggestionChip
          text={`${pet.name} has been scratching a lot`}
          onPress={onSuggestion}
        />
        <SuggestionChip
          text={`How is ${pet.name}'s health looking?`}
          onPress={onSuggestion}
        />
      </View>
    </View>
  )
}

// ─── Suggestion Chip ────────────────────────────────────────────────────────

function SuggestionChip({
  text,
  onPress,
}: {
  text: string
  onPress: (text: string) => void
}) {
  return (
    <Pressable
      onPress={() => {
        hapticTap()
        onPress(text)
      }}
      style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
    >
      <View
        className="rounded-xl px-4 py-3.5 bg-surface flex-row items-center justify-between"
        style={shadow}
      >
        <Text className="text-[14px] text-fg flex-1">{text}</Text>
        <Ionicons
          name="arrow-forward"
          size={14}
          color={colors.muted}
          style={{ marginLeft: 8 }}
        />
      </View>
    </Pressable>
  )
}

// ─── Message Bubble ─────────────────────────────────────────────────────────

function MessageBubble({
  message,
  onSaveLog,
  onUpdatePet,
}: {
  message: ChatMessage
  onSaveLog: (log: Partial<LogEntry>) => void
  onUpdatePet: (updates: Partial<Pet>) => void
}) {
  const isUser = message.role === 'user'

  return (
    <View className={`mb-3 ${isUser ? 'items-end' : 'items-start'}`}>
      {!isUser && (
        <View className="flex-row items-center gap-2 mb-1.5 px-1">
          <View className="w-6 h-6 rounded-lg bg-accent items-center justify-center">
            <Text className="text-[10px] font-bold text-white">P</Text>
          </View>
          <Text className="text-[11px] font-medium text-muted">
            PawTrack
          </Text>
        </View>
      )}

      <View
        className={`max-w-[85%] rounded-2xl px-4 py-3 ${isUser ? 'bg-fg' : 'bg-surface'}`}
        style={isUser ? undefined : shadow}
      >
        {message.imageUri && (
          <Image
            source={{ uri: message.imageUri }}
            className="w-full h-[150px] rounded-lg mb-2"
            resizeMode="cover"
          />
        )}

        <Text
          className={`text-[14px] leading-[21px] ${isUser ? 'text-white' : 'text-fg'}`}
        >
          {message.content}
        </Text>
      </View>

      {message.suggestedLogs && message.suggestedLogs.length > 0 && (
        <View className="mt-2 max-w-[85%] gap-2">
          {message.suggestedLogs.map((log, i) => (
            <LogSuggestionCard key={i} log={log} onSave={onSaveLog} />
          ))}
        </View>
      )}

      {message.petUpdates &&
        Object.keys(message.petUpdates).length > 0 && (
          <View className="mt-2 max-w-[85%]">
            <PetUpdateCard
              updates={message.petUpdates}
              onUpdate={onUpdatePet}
            />
          </View>
        )}
    </View>
  )
}

// ─── Log Suggestion Card ────────────────────────────────────────────────────

function LogSuggestionCard({
  log,
  onSave,
}: {
  log: Partial<LogEntry>
  onSave: (l: Partial<LogEntry>) => void
}) {
  const [saved, setSaved] = useState(false)

  return (
    <View className="bg-surface rounded-2xl overflow-hidden" style={shadow}>
      <View
        className="px-4 py-2.5 flex-row items-center gap-2"
        style={{ backgroundColor: colors.green + '10' }}
      >
        <Text
          className="text-[10px] font-semibold uppercase tracking-wider"
          style={{ color: colors.green }}
        >
          {log.type?.replace('_', ' ') || 'log'}
        </Text>
        <Text className="text-[11px] text-muted">{log.date}</Text>
      </View>

      <View className="px-4 py-3">
        <Text className="text-[14px] font-semibold text-fg">{log.title}</Text>
        {log.notes ? (
          <Text className="text-[12px] text-muted mt-1">{log.notes}</Text>
        ) : null}
        {log.data?.weight ? (
          <Text className="font-mono text-[18px] text-fg mt-1">
            {log.data.weight} {log.data.weightUnit || 'kg'}
          </Text>
        ) : null}

        <Pressable
          onPress={() => {
            if (saved) return
            onSave(log)
            setSaved(true)
          }}
          style={({ pressed }) => ({
            opacity: !saved && pressed ? 0.7 : 1,
          })}
        >
          <View
            className="mt-3 rounded-lg py-2.5 items-center"
            style={{
              backgroundColor: saved ? colors.green : colors.fieldBg,
            }}
          >
            <Text
              className="text-[13px] font-semibold"
              style={{ color: saved ? '#FFFFFF' : colors.fg }}
            >
              {saved ? '\u2713  Saved!' : 'Save Log'}
            </Text>
          </View>
        </Pressable>
      </View>
    </View>
  )
}

// ─── Pet Update Card ────────────────────────────────────────────────────────

function PetUpdateCard({
  updates,
  onUpdate,
}: {
  updates: Partial<Pet>
  onUpdate: (u: Partial<Pet>) => void
}) {
  const [applied, setApplied] = useState(false)
  const fields = Object.entries(updates).filter(
    ([, v]) => v != null && v !== '',
  )
  if (fields.length === 0) return null

  return (
    <View className="bg-surface rounded-2xl overflow-hidden" style={shadow}>
      <View
        className="px-4 py-2.5"
        style={{ backgroundColor: colors.blue + '10' }}
      >
        <Text
          className="text-[10px] font-semibold uppercase tracking-wider"
          style={{ color: colors.blue }}
        >
          Pet Info Update
        </Text>
      </View>

      <View className="px-4 py-3 gap-1.5">
        {fields.map(([key, value]) => (
          <View key={key} className="flex-row items-center gap-2">
            <Text className="text-[13px] text-muted capitalize">{key}:</Text>
            <Text className="text-[13px] font-semibold text-fg">
              {String(value)}
            </Text>
          </View>
        ))}

        <Pressable
          onPress={() => {
            if (applied) return
            onUpdate(updates)
            setApplied(true)
          }}
          style={({ pressed }) => ({
            opacity: !applied && pressed ? 0.7 : 1,
          })}
        >
          <View
            className="mt-2 rounded-lg py-2.5 items-center"
            style={{
              backgroundColor: applied ? colors.blue : colors.fieldBg,
            }}
          >
            <Text
              className="text-[13px] font-semibold"
              style={{ color: applied ? '#FFFFFF' : colors.fg }}
            >
              {applied ? '\u2713  Updated!' : 'Update Pet'}
            </Text>
          </View>
        </Pressable>
      </View>
    </View>
  )
}
