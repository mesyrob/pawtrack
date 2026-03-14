import React from 'react'
import { View, Text, Switch } from 'react-native'
import { colors } from '@/lib/theme'
import { hapticSelect } from '@/lib/haptics'

interface ToggleProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label?: string
}

export default function Toggle({ checked, onChange, label }: ToggleProps) {
  return (
    <View className="flex-row items-center gap-3">
      <Switch
        value={checked}
        onValueChange={(v) => {
          hapticSelect()
          onChange(v)
        }}
        trackColor={{ false: '#E5E5E5', true: colors.accent }}
        thumbColor="#FFFFFF"
        ios_backgroundColor="#E5E5E5"
      />
      {label && (
        <Text className="text-sm text-fg">{label}</Text>
      )}
    </View>
  )
}
