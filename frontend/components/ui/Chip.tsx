import React from 'react'
import { Pressable, Text, View } from 'react-native'
import { brutShadowSubtle } from '@/lib/theme'
import { hapticTap } from '@/lib/haptics'

interface ChipProps {
  label: string
  active?: boolean
  color?: string
  onPress?: () => void
}

export default function Chip({ label, active = false, color = '#FFE03D', onPress }: ChipProps) {
  return (
    <Pressable
      onPress={() => {
        hapticTap()
        onPress?.()
      }}
    >
      <View
        className="px-4 py-2 border-[1.5px] rounded-lg"
        style={[
          {
            backgroundColor: active ? color : '#FFFFFF',
            borderColor: active ? color : 'rgba(26,26,26,0.3)',
          },
          active ? brutShadowSubtle : undefined,
        ]}
      >
        <Text className={`text-[13px] font-semibold ${active ? 'text-fg' : 'text-fg/70'}`}>
          {label}
        </Text>
      </View>
    </Pressable>
  )
}
