import React from 'react'
import {
  View,
  Text,
  ScrollView,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { usePets } from '@/contexts/PetContext'
import { colors } from '@/lib/theme'
import LogForm from '@/components/log/LogForm'

export default function LogModal() {
  const router = useRouter()
  const { activePet, isLoaded } = usePets()

  if (!isLoaded || !activePet) return null

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={['top']}>
      {/* Modal Handle */}
      <View className="items-center pt-2 pb-1">
        <View className="w-9 h-1 rounded-full bg-fg/10" />
      </View>

      {/* Header */}
      <View className="px-5 py-3 flex-row items-center justify-between">
        <View>
          <Text className="text-[22px] font-bold text-fg">New Log</Text>
          <Text className="text-[13px] text-muted mt-0.5">
            For {activePet.name}
          </Text>
        </View>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}
          className="w-8 h-8 items-center justify-center bg-fg/[0.06] rounded-full"
        >
          <Ionicons name="close" size={18} color={colors.fg} />
        </Pressable>
      </View>

      {/* Form */}
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          className="flex-1"
          contentContainerClassName="px-5 py-4 pb-10"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <LogForm />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
