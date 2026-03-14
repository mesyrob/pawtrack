import { Stack } from 'expo-router'
import { colors } from '@/lib/theme'

export default function ChatStack() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.bg },
        headerTintColor: colors.fg,
        contentStyle: { backgroundColor: colors.bg },
      }}
    />
  )
}
