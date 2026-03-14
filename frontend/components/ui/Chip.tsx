import React from 'react'
import { Pressable, Text, View } from 'react-native'
import { hapticTap } from '@/lib/haptics'

interface ChipProps {
  label: string
  active?: boolean
  color?: string
  onPress?: () => void
}

export default function Chip({
  label,
  active = false,
  color = '#FF6B35',
  onPress,
}: ChipProps) {
  return (
    <Pressable
      onPress={() => {
        hapticTap()
        onPress?.()
      }}
      style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
    >
      <View
        className="px-4 py-2 rounded-full"
        style={{
          backgroundColor: active ? color + '15' : '#F4F3EF',
          borderWidth: 1,
          borderColor: active ? color + '30' : 'transparent',
        }}
      >
        <Text
          className="text-[13px] font-medium"
          style={{ color: active ? color : '#8A8570' }}
        >
          {label}
        </Text>
      </View>
    </Pressable>
  )
}
