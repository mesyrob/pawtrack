import React, { useState } from 'react'
import { View, Text, Pressable, Modal, ScrollView } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { colors, shadowLg } from '@/lib/theme'
import { hapticSelect } from '@/lib/haptics'

interface SelectOption {
  value: string
  label: string
}

interface SelectProps {
  label?: string
  options: SelectOption[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
  error?: string
}

export default function Select({
  label,
  options,
  value,
  onChange,
  placeholder,
  error,
}: SelectProps) {
  const [open, setOpen] = useState(false)
  const selected = options.find((o) => o.value === value)

  return (
    <View className="gap-2">
      {label && (
        <Text className="text-[13px] font-semibold text-muted">{label}</Text>
      )}
      <Pressable
        onPress={() => {
          hapticSelect()
          setOpen(true)
        }}
        style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
        className={`bg-field-bg border rounded-lg px-4 py-3.5 flex-row items-center justify-between ${
          error ? 'border-red-500' : 'border-fg/[0.06]'
        }`}
      >
        <Text
          className={`text-[15px] ${selected ? 'text-fg' : 'text-muted'}`}
        >
          {selected?.label || placeholder || 'Select...'}
        </Text>
        <Ionicons name="chevron-down" size={16} color={colors.muted} />
      </Pressable>

      <Modal visible={open} transparent animationType="fade">
        <Pressable
          className="flex-1 justify-end"
          style={{ backgroundColor: 'rgba(0,0,0,0.25)' }}
          onPress={() => setOpen(false)}
        >
          <Pressable onPress={() => {}}>
            <View className="bg-surface rounded-t-2xl" style={shadowLg}>
              <View className="items-center pt-3 pb-1">
                <View className="w-9 h-1 rounded-full bg-fg/10" />
              </View>
              <View className="px-5 py-3">
                <Text className="text-[15px] font-semibold text-fg">
                  {label || 'Select'}
                </Text>
              </View>
              <ScrollView style={{ maxHeight: 320 }}>
                {options.map((option) => (
                  <Pressable
                    key={option.value}
                    onPress={() => {
                      hapticSelect()
                      onChange(option.value)
                      setOpen(false)
                    }}
                    style={({ pressed }) => ({
                      opacity: pressed ? 0.7 : 1,
                    })}
                    className={`px-5 py-4 flex-row items-center justify-between ${
                      value === option.value ? 'bg-accent/[0.06]' : ''
                    }`}
                  >
                    <Text
                      className={`text-[16px] ${value === option.value ? 'text-accent font-semibold' : 'text-fg'}`}
                    >
                      {option.label}
                    </Text>
                    {value === option.value && (
                      <Ionicons
                        name="checkmark"
                        size={20}
                        color={colors.accent}
                      />
                    )}
                  </Pressable>
                ))}
              </ScrollView>
              <View className="h-8" />
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {error && (
        <Text className="text-[12px] text-red-500 font-medium">{error}</Text>
      )}
    </View>
  )
}
