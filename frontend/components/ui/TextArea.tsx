import React, { useState } from 'react'
import { View, Text, TextInput, TextInputProps } from 'react-native'
import { colors } from '@/lib/theme'

interface TextAreaProps extends Omit<TextInputProps, 'onChange'> {
  label?: string
  hint?: string
  error?: string
  onChange?: (text: string) => void
}

export default function TextArea({
  label,
  hint,
  error,
  onChange,
  style,
  ...props
}: TextAreaProps) {
  const [focused, setFocused] = useState(false)

  return (
    <View className="gap-2">
      {label && (
        <Text className="text-[13px] font-semibold text-muted">{label}</Text>
      )}
      <TextInput
        multiline
        numberOfLines={4}
        textAlignVertical="top"
        className={`bg-field-bg rounded-lg px-4 py-3.5 text-[15px] text-fg min-h-[100px] border ${
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
