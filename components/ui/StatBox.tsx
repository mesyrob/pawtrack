import React from 'react'
import { View, Text } from 'react-native'
import { brutShadowSm } from '@/lib/theme'

interface StatBoxProps {
  label: string
  value: string | number
  sub?: string
  color?: string
}

export default function StatBox({ label, value, sub, color = '#FFE03D' }: StatBoxProps) {
  return (
    <View
      className="flex-1 border-[2.5px] border-fg rounded-[3px] p-3 gap-1"
      style={[brutShadowSm, { backgroundColor: color }]}
    >
      <Text className="font-mono uppercase text-[9px] tracking-[1.5px] text-fg opacity-70">
        {label}
      </Text>
      <Text className="font-mono text-2xl leading-none text-fg">
        {value}
      </Text>
      {sub && (
        <Text className="text-[11px] text-fg opacity-70">{sub}</Text>
      )}
    </View>
  )
}
