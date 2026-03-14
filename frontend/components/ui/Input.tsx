import React, { useState } from 'react'
import { View, Text, TextInput, TextInputProps } from 'react-native'
import { colors } from '@/lib/theme'

interface InputProps extends Omit<TextInputProps, 'onChange'> {
  label?: string
  hint?: string
  error?: string
  onChange?: (text: string) => void
}

export default function Input({ label, hint, error, onChange, style, ...props }: InputProps) {
  const [focused, setFocused] = useState(false)

  return (
    <View className="gap-2">
      {label && (
        <Text className="text-[13px] font-semibold text-muted">{label}</Text>
      )}
      <TextInput
        className={`bg-field-bg rounded-lg px-4 py-3.5 text-[15px] text-fg border ${
          error
            ? 'border-red-500'
            : focused
              ? 'border-accent/50'
              : 'border-fg/[0.06]'
        }`}
        style={style}
        placeholderTextColor={colors.muted}
        onChangeText={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        {...props}
      />
      {hint && !error && (
        <Text className="text-[12px] text-muted">{hint}</Text>
      )}
      {error && (
        <Text className="text-[12px] text-red-500 font-medium">{error}</Text>
      )}
    </View>
  )
}
