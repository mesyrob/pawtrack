import React from 'react'
import { Pressable, View, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { colors } from '@/lib/theme'
import { hapticTap } from '@/lib/haptics'

export default function FloatingLogButton() {
  const router = useRouter()
  const insets = useSafeAreaInsets()

  return (
    <Pressable
      onPress={() => {
        hapticTap()
        router.push('/log')
      }}
      style={[styles.wrapper, { bottom: insets.bottom + 70 }]}
    >
      {({ pressed }) => (
        <View
          style={[
            styles.button,
            pressed && styles.pressed,
          ]}
        >
          <Ionicons name="add" size={28} color="#FFFFFF" />
        </View>
      )}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    right: 20,
  },
  button: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2.5,
    borderColor: colors.fg,
    shadowColor: colors.fg,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 6,
  },
  pressed: {
    shadowOffset: { width: 1, height: 1 },
    transform: [{ translateX: 2 }, { translateY: 2 }],
  },
})
