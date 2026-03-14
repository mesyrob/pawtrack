import React from 'react'
import { View, Text, Switch } from 'react-native'
import { colors } from '@/lib/theme'

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
        onValueChange={onChange}
        trackColor={{ false: colors.surface, true: colors.accent }}
        thumbColor={colors.fg}
        ios_backgroundColor={colors.surface}
        style={{ borderWidth: 1.5, borderColor: colors.fg, borderRadius: 16 }}
      />
      {label && (
        <Text className="text-sm text-fg">{label}</Text>
      )}
    </View>
  )
}
