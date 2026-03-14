import React, { useEffect } from 'react'
import { View, ActivityIndicator } from 'react-native'
import { useRouter } from 'expo-router'
import { usePets } from '@/contexts/PetContext'
import { colors } from '@/lib/theme'

export default function Home() {
  const { pets, isLoaded } = usePets()
  const router = useRouter()

  useEffect(() => {
    if (!isLoaded) return
    if (pets.length > 0) {
      router.replace('/dashboard')
    } else {
      router.replace('/onboarding')
    }
  }, [isLoaded, pets, router])

  return (
    <View className="flex-1 items-center justify-center bg-bg">
      <ActivityIndicator size="large" color={colors.fg} />
    </View>
  )
}
