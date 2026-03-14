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
import { colors, brutShadow, brutShadowSm, brutShadowSubtle } from '@/lib/theme'

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
      // Get upload URL
      const { url, s3Key } = await api.getUploadUrl(asset.mimeType || 'image/jpeg')

      // Upload to S3
      const blob = await fetch(uri).then((r) => r.blob())
      await fetch(url, {
        method: 'PUT',
        body: blob,
        headers: { 'Content-Type': asset.mimeType || 'image/jpeg' },
      })

      // Send to chat with the s3Key
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
      <View className="flex-1 items-center justify-center bg-bg">
        <ActivityIndicator size="large" color={colors.fg} />
      </View>
    )
  }

  if (!activePet) return null

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={['top']}>
      {/* Header */}
      <View className="px-5 pt-3 pb-3 border-b-[2px] border-fg/10">
        <Text className="text-muted text-[13px] font-semibold">{activePet.name}'s</Text>
        <Text className="font-mono text-[28px] uppercase tracking-[1px] text-fg leading-tight">
          Chat
        </Text>
      </View>

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={90}
      >
        {/* Messages */}
        <ScrollView
          ref={scrollRef}
          className="flex-1 px-4"
          contentContainerStyle={{ paddingTop: 16, paddingBottom: 16 }}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}
        >
          {messages.length === 0 && (
            <View className="items-center justify-center pt-20 px-8">
              <Text className="text-[48px] mb-4">&#x1F4AC;</Text>
              <Text className="font-mono text-[16px] text-fg text-center uppercase tracking-wider">
                Ask PawTrack AI
              </Text>
              <Text className="text-[14px] text-muted text-center mt-2 leading-5">
                Tell me about {activePet.name}'s health events and I'll help you log them.
                You can also send photos!
              </Text>
              <View className="mt-6 gap-2">
                <SuggestionChip text={`${activePet.name} weighed 4.5kg today`} onPress={sendMessage} />
                <SuggestionChip text={`Got a rabies vaccine at the vet`} onPress={sendMessage} />
                <SuggestionChip text={`Noticed some scratching`} onPress={sendMessage} />
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
            <View className="flex-row items-center gap-2 px-2 py-3">
              <ActivityIndicator size="small" color={colors.accent} />
              <Text className="text-[13px] text-muted">Thinking...</Text>
            </View>
          )}
        </ScrollView>

        {/* Input */}
        <View className="px-4 py-3 border-t-[2px] border-fg/10 bg-bg">
          <View className="flex-row items-end gap-2">
            <Pressable
              onPress={handlePhoto}
              className="w-10 h-10 items-center justify-center border-[2px] border-fg rounded-md bg-surface"
              style={brutShadowSubtle}
            >
              <Text className="text-[18px]">&#x1F4F7;</Text>
            </Pressable>

            <View
              className="flex-1 border-[2px] border-fg rounded-md bg-surface px-3 py-2 min-h-[40px] max-h-[100px]"
              style={brutShadowSubtle}
            >
              <TextInput
                className="text-[15px] text-fg"
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
              className="w-10 h-10 items-center justify-center border-[2px] border-fg rounded-md"
              style={[
                { backgroundColor: input.trim() ? colors.accent : colors.surface },
                brutShadowSubtle,
              ]}
            >
              <Text className="text-[18px] font-bold" style={{ color: input.trim() ? '#fff' : colors.muted }}>
                &#x2191;
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
      className="border-[2px] border-fg rounded-md px-4 py-2.5 bg-surface"
      style={brutShadowSubtle}
    >
      <Text className="text-[13px] text-fg">{text}</Text>
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
    <View className={`mb-3 ${isUser ? 'items-end' : 'items-start'}`}>
      <View
        className={`max-w-[85%] border-[2px] border-fg rounded-md px-4 py-3 ${
          isUser ? 'bg-fg' : 'bg-surface'
        }`}
        style={isUser ? undefined : brutShadowSm}
      >
        {message.imageUri && (
          <Image
            source={{ uri: message.imageUri }}
            className="w-full h-[150px] rounded-sm mb-2"
            resizeMode="cover"
          />
        )}

        <Text className={`text-[14px] leading-5 ${isUser ? 'text-bg' : 'text-fg'}`}>
          {message.content}
        </Text>
      </View>

      {/* Suggested logs */}
      {message.suggestedLogs && message.suggestedLogs.length > 0 && (
        <View className="mt-2 max-w-[85%] gap-2">
          {message.suggestedLogs.map((log, i) => (
            <LogSuggestionCard key={i} log={log} onSave={onSaveLog} />
          ))}
        </View>
      )}

      {/* Pet updates */}
      {message.petUpdates && Object.keys(message.petUpdates).length > 0 && (
        <View className="mt-2 max-w-[85%]">
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
      className="border-[2px] border-fg rounded-md bg-green/10 px-4 py-3"
      style={brutShadowSubtle}
    >
      <View className="flex-row items-center justify-between mb-1">
        <View className="flex-row items-center gap-2">
          <View className="bg-green px-2 py-0.5 rounded-sm">
            <Text className="text-[10px] font-bold uppercase tracking-wide text-fg">
              {log.type?.replace('_', ' ') || 'log'}
            </Text>
          </View>
          <Text className="text-[11px] text-muted">{log.date}</Text>
        </View>
      </View>

      <Text className="text-[14px] font-semibold text-fg mt-1">{log.title}</Text>

      {log.notes && (
        <Text className="text-[12px] text-muted mt-0.5">{log.notes}</Text>
      )}

      {log.data?.weight && (
        <Text className="font-mono text-[16px] text-fg mt-1">
          {log.data.weight} {log.data.weightUnit || 'kg'}
        </Text>
      )}

      <Pressable
        onPress={() => {
          if (saved) return
          onSave(log)
          setSaved(true)
        }}
        className={`mt-2 border-[2px] border-fg rounded-md px-3 py-2 items-center ${
          saved ? 'bg-green' : 'bg-surface'
        }`}
        style={saved ? undefined : brutShadowSubtle}
      >
        <Text className="text-[13px] font-bold text-fg">
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

  const fields = Object.entries(updates).filter(([_, v]) => v != null && v !== '')

  if (fields.length === 0) return null

  return (
    <View
      className="border-[2px] border-fg rounded-md bg-blue/10 px-4 py-3"
      style={brutShadowSubtle}
    >
      <Text className="text-[12px] font-bold uppercase tracking-wide text-blue mb-2">
        Pet Info Update
      </Text>

      {fields.map(([key, value]) => (
        <View key={key} className="flex-row items-center gap-2 mb-1">
          <Text className="text-[13px] text-muted capitalize">{key}:</Text>
          <Text className="text-[13px] font-semibold text-fg">{String(value)}</Text>
        </View>
      ))}

      <Pressable
        onPress={() => {
          if (applied) return
          onUpdate(updates)
          setApplied(true)
        }}
        className={`mt-2 border-[2px] border-fg rounded-md px-3 py-2 items-center ${
          applied ? 'bg-blue' : 'bg-surface'
        }`}
        style={applied ? undefined : brutShadowSubtle}
      >
        <Text className={`text-[13px] font-bold ${applied ? 'text-surface' : 'text-fg'}`}>
          {applied ? 'Updated!' : 'Update Pet'}
        </Text>
      </Pressable>
    </View>
  )
}
