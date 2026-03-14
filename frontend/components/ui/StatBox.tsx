import React from 'react'
import { View, Text } from 'react-native'
import { shadow } from '@/lib/theme'

interface StatBoxProps {
  label: string
  value: string | number
  sub?: string
  color?: string
}

export default function StatBox({ label, value, sub, color }: StatBoxProps) {
  return (
    <View
      className="flex-1 bg-surface rounded-xl p-4 gap-1"
      style={shadow}
    >
      <Text className="text-[11px] font-semibold text-muted uppercase tracking-wider">
        {label}
      </Text>
      <Text
        className="font-mono text-2xl leading-none"
        style={color ? { color } : undefined}
      >
        {value}
      </Text>
      {sub && <Text className="text-[11px] text-muted">{sub}</Text>}
    </View>
  )
}
