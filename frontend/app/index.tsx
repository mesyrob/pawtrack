import { Redirect } from 'expo-router'
import { View, ActivityIndicator } from 'react-native'
import { usePets } from '@/contexts/PetContext'
import { colors } from '@/lib/theme'

export default function Index() {
  const { pets, isLoaded } = usePets()

  if (!isLoaded) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg }}>
        <ActivityIndicator size="large" color={colors.fg} />
      </View>
    )
  }

  if (pets.length === 0) {
    return <Redirect href="/onboarding" />
  }

  return <Redirect href="/(tabs)" />
}
