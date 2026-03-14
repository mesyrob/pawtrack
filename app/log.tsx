import React, { useEffect } from 'react'
import { View, Text, ScrollView, Pressable, KeyboardAvoidingView, Platform } from 'react-native'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { usePets } from '@/contexts/PetContext'
import { brutShadowSm } from '@/lib/theme'
import LogForm from '@/components/log/LogForm'

export default function LogPage() {
  const router = useRouter()
  const { activePet, isLoaded } = usePets()

  useEffect(() => {
    if (isLoaded && !activePet) {
      router.replace('/onboarding')
    }
  }, [isLoaded, activePet, router])

  if (!isLoaded || !activePet) return null

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={['top']}>
      {/* Header */}
      <View className="bg-surface border-b-2 border-fg px-4 py-3 flex-row items-center gap-3">
        <Pressable
          onPress={() => router.back()}
          className="w-8 h-8 items-center justify-center border-2 border-fg rounded-[3px] bg-bg"
          style={brutShadowSm}
        >
          <Text className="font-mono text-[14px] text-fg">←</Text>
        </Pressable>
        <View>
          <Text className="font-mono text-[14px] uppercase tracking-[2px] text-fg leading-none">
            New Log
          </Text>
          <Text className="text-[11px] text-muted">
            For {activePet.name}
          </Text>
        </View>
      </View>

      {/* Form */}
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          className="flex-1"
          contentContainerClassName="p-4 max-w-lg self-center w-full"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <LogForm />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
