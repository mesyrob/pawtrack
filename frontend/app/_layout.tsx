import React, { useEffect } from 'react'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useFonts } from 'expo-font'
import { SpaceMono_700Bold } from '@expo-google-fonts/space-mono'
import * as SplashScreen from 'expo-splash-screen'
import { PetProvider } from '@/contexts/PetContext'
import '../global.css'

SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    SpaceMono_700Bold,
  })

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync()
    }
  }, [fontsLoaded])

  if (!fontsLoaded) return null

  return (
    <PetProvider>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }} />
    </PetProvider>
  )
}
