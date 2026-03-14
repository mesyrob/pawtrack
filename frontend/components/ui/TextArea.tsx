import React, { useState } from 'react'
import { View, Text, TextInput, TextInputProps } from 'react-native'
import { brutShadowSubtle, colors } from '@/lib/theme'

interface TextAreaProps extends Omit<TextInputProps, 'onChange'> {
  label?: string
  hint?: string
  error?: string
  onChange?: (text: string) => void
}

export default function TextArea({ label, hint, error, onChange, style, ...props }: TextAreaProps) {
  const [focused, setFocused] = useState(false)

  return (
    <View className="gap-1.5">
      {label && (
        <Text className="font-mono uppercase text-[11px] tracking-[1.5px] text-fg">
          {label}
        </Text>
      )}
      <TextInput
        multiline
        numberOfLines={4}
        textAlignVertical="top"
        className={`bg-surface border-[1.5px] rounded-md px-3.5 py-3 text-[15px] text-fg min-h-[100px] ${error ? 'border-red-600' : focused ? 'border-accent' : 'border-fg/40'}`}
        style={[brutShadowSubtle, style]}
        placeholderTextColor={colors.muted}
        onChangeText={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        {...props}
      />
      {hint && !error && (
        <Text className="text-[11px] text-muted">{hint}</Text>
      )}
      {error && (
        <Text className="text-[11px] text-red-600 font-semibold">{error}</Text>
      )}
    </View>
  )
}
