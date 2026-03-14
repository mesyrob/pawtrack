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
      className="flex-1 border-[2.5px] border-fg rounded-md p-4 gap-1"
      style={[brutShadowSm, { backgroundColor: color }]}
    >
      <Text className="text-[10px] font-semibold text-fg/60 uppercase tracking-wide">
        {label}
      </Text>
      <Text className="font-mono text-2xl leading-none text-fg">
        {value}
      </Text>
      {sub && (
        <Text className="text-[11px] text-fg/60">{sub}</Text>
      )}
    </View>
  )
}
