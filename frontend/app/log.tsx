import React, { useEffect } from 'react'
import { View, Text, ScrollView, Pressable, KeyboardAvoidingView, Platform } from 'react-native'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { usePets } from '@/contexts/PetContext'
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
      <View className="bg-surface border-b border-fg/10 px-5 py-3 flex-row items-center gap-3">
        <Pressable
          onPress={() => router.back()}
          className="py-1"
        >
          <Text className="text-[15px] font-semibold text-accent">← Back</Text>
        </Pressable>
        <View className="flex-1">
          <Text className="font-mono text-[14px] uppercase tracking-[2px] text-fg leading-none">
            New Log
          </Text>
          <Text className="text-[12px] text-muted mt-0.5">
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
          contentContainerClassName="px-5 py-4"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <LogForm />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
