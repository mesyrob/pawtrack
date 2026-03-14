import React, { useState, useRef, useCallback } from 'react'
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import * as ImagePicker from 'expo-image-picker'
import { usePets } from '@/contexts/PetContext'
import * as api from '@/lib/api'
import { ChatMessage, LogEntry, Pet } from '@/lib/types'
import { generateId } from '@/lib/utils'
import { colors, brutShadowSm, brutShadowSubtle } from '@/lib/theme'

export default function ChatPage() {
  const { activePet, addLog, updatePet, isLoaded } = usePets()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef<ScrollView>(null)

  const scrollToBottom = useCallback(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100)
  }, [])

  const sendMessage = useCallback(async (text?: string, imageUri?: string, s3Key?: string) => {
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
    } catch (err) {
      const errorMsg: ChatMessage = {
        id: generateId(),
        role: 'assistant',
        content: 'Sorry, I had trouble processing that. Please try again.',
        timestamp: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, errorMsg])
      console.error('[Chat] Error:', err)
    } finally {
      setLoading(false)
      scrollToBottom()
    }
  }, [activePet, scrollToBottom])

  const handleSend = useCallback(() => {
    const text = input.trim()
    if (!text) return
    sendMessage(text)
  }, [input, sendMessage])

  const handlePhoto = useCallback(async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    })

    if (result.canceled || !result.assets[0]) return

    const asset = result.assets[0]
    const uri = asset.uri

    try {
      const { url, s3Key } = await api.getUploadUrl(asset.mimeType || 'image/jpeg')

      const blob = await fetch(uri).then((r) => r.blob())
      await fetch(url, {
        method: 'PUT',
        body: blob,
        headers: { 'Content-Type': asset.mimeType || 'image/jpeg' },
      })

      const text = input.trim()
      sendMessage(text || undefined, uri, s3Key)
    } catch (err) {
      console.error('[Chat] Photo upload failed:', err)
    }
  }, [input, sendMessage])

  const handleSaveLog = useCallback((logData: Partial<LogEntry>) => {
    if (!activePet) return

    const log: LogEntry = {
      id: generateId(),
      petId: activePet.id,
      type: logData.type || 'note',
      date: logData.date || new Date().toISOString().slice(0, 10),
      title: logData.title || 'Log entry',
      notes: logData.notes,
      data: logData.data,
      createdAt: new Date().toISOString(),
    }

    addLog(log)
  }, [activePet, addLog])

  const handleUpdatePet = useCallback((updates: Partial<Pet>) => {
    if (!activePet) return

    const updated: Pet = {
      ...activePet,
      ...updates,
      id: activePet.id,
      createdAt: activePet.createdAt,
      trackingConfig: activePet.trackingConfig,
    }

    updatePet(updated)
  }, [activePet, updatePet])

  if (!isLoaded) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg }}>
        <ActivityIndicator size="large" color={colors.fg} />
      </View>
    )
  }

  if (!activePet) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg }}>
        <Text style={{ fontSize: 16, color: colors.muted }}>No pet selected</Text>
      </View>
    )
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={['top']}>
      {/* Header */}
      <View style={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 12, borderBottomWidth: 2, borderBottomColor: colors.fg + '1A' }}>
        <Text style={{ color: colors.muted, fontSize: 13, fontWeight: '600' }}>{activePet.name}'s</Text>
        <Text style={{ fontFamily: 'SpaceMono_700Bold', fontSize: 28, textTransform: 'uppercase', letterSpacing: 1, color: colors.fg }}>
          Chat
        </Text>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={90}
      >
        {/* Messages */}
        <ScrollView
          ref={scrollRef}
          style={{ flex: 1, paddingHorizontal: 16 }}
          contentContainerStyle={{ paddingTop: 16, paddingBottom: 16 }}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}
        >
          {messages.length === 0 && (
            <View style={{ alignItems: 'center', justifyContent: 'center', paddingTop: 80, paddingHorizontal: 32 }}>
              <Text style={{ fontSize: 48, marginBottom: 16 }}>{'\uD83D\uDCAC'}</Text>
              <Text style={{ fontFamily: 'SpaceMono_700Bold', fontSize: 16, color: colors.fg, textAlign: 'center', textTransform: 'uppercase', letterSpacing: 2 }}>
                Ask PawTrack AI
              </Text>
              <Text style={{ fontSize: 14, color: colors.muted, textAlign: 'center', marginTop: 8, lineHeight: 20 }}>
                Tell me about {activePet.name}'s health events and I'll help you log them. You can also send photos!
              </Text>
              <View style={{ marginTop: 24, gap: 8 }}>
                <SuggestionChip text={`${activePet.name} weighed 4.5kg today`} onPress={sendMessage} />
                <SuggestionChip text="Got a rabies vaccine at the vet" onPress={sendMessage} />
                <SuggestionChip text="Noticed some scratching" onPress={sendMessage} />
              </View>
            </View>
          )}

          {messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              onSaveLog={handleSaveLog}
              onUpdatePet={handleUpdatePet}
            />
          ))}

          {loading && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 8, paddingVertical: 12 }}>
              <ActivityIndicator size="small" color={colors.accent} />
              <Text style={{ fontSize: 13, color: colors.muted }}>Thinking...</Text>
            </View>
          )}
        </ScrollView>

        {/* Input */}
        <View style={{ paddingHorizontal: 16, paddingVertical: 12, borderTopWidth: 2, borderTopColor: colors.fg + '1A', backgroundColor: colors.bg }}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 8 }}>
            <Pressable
              onPress={handlePhoto}
              style={[{
                width: 40, height: 40, alignItems: 'center', justifyContent: 'center',
                borderWidth: 2, borderColor: colors.fg, borderRadius: 8, backgroundColor: colors.surface,
              }, brutShadowSubtle]}
            >
              <Text style={{ fontSize: 18 }}>{'\uD83D\uDCF7'}</Text>
            </Pressable>

            <View
              style={[{
                flex: 1, borderWidth: 2, borderColor: colors.fg, borderRadius: 8,
                backgroundColor: colors.surface, paddingHorizontal: 12, paddingVertical: 8,
                minHeight: 40, maxHeight: 100,
              }, brutShadowSubtle]}
            >
              <TextInput
                style={{ fontSize: 15, color: colors.fg }}
                placeholder={`Ask about ${activePet.name}...`}
                placeholderTextColor={colors.muted}
                value={input}
                onChangeText={setInput}
                multiline
                onSubmitEditing={handleSend}
                blurOnSubmit
                editable={!loading}
              />
            </View>

            <Pressable
              onPress={handleSend}
              disabled={loading || !input.trim()}
              style={[{
                width: 40, height: 40, alignItems: 'center', justifyContent: 'center',
                borderWidth: 2, borderColor: colors.fg, borderRadius: 8,
                backgroundColor: input.trim() ? colors.accent : colors.surface,
              }, brutShadowSubtle]}
            >
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: input.trim() ? '#fff' : colors.muted }}>
                {'\u2191'}
              </Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

function SuggestionChip({ text, onPress }: { text: string; onPress: (text: string) => void }) {
  return (
    <Pressable
      onPress={() => onPress(text)}
      style={[{
        borderWidth: 2, borderColor: colors.fg, borderRadius: 8,
        paddingHorizontal: 16, paddingVertical: 10, backgroundColor: colors.surface,
      }, brutShadowSubtle]}
    >
      <Text style={{ fontSize: 13, color: colors.fg }}>{text}</Text>
    </Pressable>
  )
}

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
    <View style={{ marginBottom: 12, alignItems: isUser ? 'flex-end' : 'flex-start' }}>
      <View
        style={[{
          maxWidth: '85%', borderWidth: 2, borderColor: colors.fg, borderRadius: 8,
          paddingHorizontal: 16, paddingVertical: 12,
          backgroundColor: isUser ? colors.fg : colors.surface,
        }, isUser ? undefined : brutShadowSm]}
      >
        {message.imageUri && (
          <Image
            source={{ uri: message.imageUri }}
            style={{ width: '100%', height: 150, borderRadius: 4, marginBottom: 8 }}
            resizeMode="cover"
          />
        )}

        <Text style={{ fontSize: 14, lineHeight: 20, color: isUser ? colors.bg : colors.fg }}>
          {message.content}
        </Text>
      </View>

      {/* Suggested logs */}
      {message.suggestedLogs && message.suggestedLogs.length > 0 && (
        <View style={{ marginTop: 8, maxWidth: '85%', gap: 8 }}>
          {message.suggestedLogs.map((log, i) => (
            <LogSuggestionCard key={i} log={log} onSave={onSaveLog} />
          ))}
        </View>
      )}

      {/* Pet updates */}
      {message.petUpdates && Object.keys(message.petUpdates).length > 0 && (
        <View style={{ marginTop: 8, maxWidth: '85%' }}>
          <PetUpdateCard updates={message.petUpdates} onUpdate={onUpdatePet} />
        </View>
      )}
    </View>
  )
}

function LogSuggestionCard({
  log,
  onSave,
}: {
  log: Partial<LogEntry>
  onSave: (log: Partial<LogEntry>) => void
}) {
  const [saved, setSaved] = useState(false)

  return (
    <View
      style={[{
        borderWidth: 2, borderColor: colors.fg, borderRadius: 8,
        backgroundColor: colors.green + '1A', paddingHorizontal: 16, paddingVertical: 12,
      }, brutShadowSubtle]}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <View style={{ backgroundColor: colors.green, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 }}>
            <Text style={{ fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 0.5, color: colors.fg }}>
              {log.type?.replace('_', ' ') || 'log'}
            </Text>
          </View>
          <Text style={{ fontSize: 11, color: colors.muted }}>{log.date}</Text>
        </View>
      </View>

      <Text style={{ fontSize: 14, fontWeight: '600', color: colors.fg, marginTop: 4 }}>{log.title}</Text>

      {log.notes ? (
        <Text style={{ fontSize: 12, color: colors.muted, marginTop: 2 }}>{log.notes}</Text>
      ) : null}

      {log.data?.weight ? (
        <Text style={{ fontFamily: 'SpaceMono_700Bold', fontSize: 16, color: colors.fg, marginTop: 4 }}>
          {log.data.weight} {log.data.weightUnit || 'kg'}
        </Text>
      ) : null}

      <Pressable
        onPress={() => {
          if (saved) return
          onSave(log)
          setSaved(true)
        }}
        style={[{
          marginTop: 8, borderWidth: 2, borderColor: colors.fg, borderRadius: 8,
          paddingHorizontal: 12, paddingVertical: 8, alignItems: 'center',
          backgroundColor: saved ? colors.green : colors.surface,
        }, saved ? undefined : brutShadowSubtle]}
      >
        <Text style={{ fontSize: 13, fontWeight: 'bold', color: colors.fg }}>
          {saved ? 'Saved!' : 'Save Log'}
        </Text>
      </Pressable>
    </View>
  )
}

function PetUpdateCard({
  updates,
  onUpdate,
}: {
  updates: Partial<Pet>
  onUpdate: (updates: Partial<Pet>) => void
}) {
  const [applied, setApplied] = useState(false)

  const fields = Object.entries(updates).filter(([, v]) => v != null && v !== '')

  if (fields.length === 0) return null

  return (
    <View
      style={[{
        borderWidth: 2, borderColor: colors.fg, borderRadius: 8,
        backgroundColor: colors.blue + '1A', paddingHorizontal: 16, paddingVertical: 12,
      }, brutShadowSubtle]}
    >
      <Text style={{ fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 0.5, color: colors.blue, marginBottom: 8 }}>
        Pet Info Update
      </Text>

      {fields.map(([key, value]) => (
        <View key={key} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <Text style={{ fontSize: 13, color: colors.muted, textTransform: 'capitalize' }}>{key}:</Text>
          <Text style={{ fontSize: 13, fontWeight: '600', color: colors.fg }}>{String(value)}</Text>
        </View>
      ))}

      <Pressable
        onPress={() => {
          if (applied) return
          onUpdate(updates)
          setApplied(true)
        }}
        style={[{
          marginTop: 8, borderWidth: 2, borderColor: colors.fg, borderRadius: 8,
          paddingHorizontal: 12, paddingVertical: 8, alignItems: 'center',
          backgroundColor: applied ? colors.blue : colors.surface,
        }, applied ? undefined : brutShadowSubtle]}
      >
        <Text style={{ fontSize: 13, fontWeight: 'bold', color: applied ? colors.surface : colors.fg }}>
          {applied ? 'Updated!' : 'Update Pet'}
        </Text>
      </Pressable>
    </View>
  )
}
