import React from 'react'
import { Pressable, Text, View } from 'react-native'
import { brutShadowSm, brutShadowPressed } from '@/lib/theme'

interface ChipProps {
  label: string
  active?: boolean
  color?: string
  onPress?: () => void
}

export default function Chip({ label, active = false, color = '#FFE03D', onPress }: ChipProps) {
  return (
    <Pressable onPress={onPress}>
      {({ pressed }) => (
        <View
          className="px-3 py-1.5 border-2 border-fg rounded-[3px]"
          style={[
            { backgroundColor: active ? color : '#FFFFFF' },
            pressed ? brutShadowPressed : brutShadowSm,
          ]}
        >
          <Text className="font-mono uppercase text-[10px] tracking-[1.5px] text-fg">
            {label}
          </Text>
        </View>
      )}
    </Pressable>
  )
}
