import React, { useState } from 'react'
import { View, Text, Pressable, Modal, ScrollView } from 'react-native'
import { brutShadowSubtle, colors } from '@/lib/theme'
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

export default function Select({ label, options, value, onChange, placeholder, error }: SelectProps) {
  const [open, setOpen] = useState(false)
  const selected = options.find((o) => o.value === value)

  return (
    <View className="gap-1.5">
      {label && (
        <Text className="font-mono uppercase text-[11px] tracking-[1.5px] text-fg">
          {label}
        </Text>
      )}
      <Pressable
        onPress={() => {
          hapticSelect()
          setOpen(true)
        }}
        style={brutShadowSubtle}
        className={`bg-surface border-[1.5px] rounded-md px-3.5 py-3 flex-row items-center justify-between ${error ? 'border-red-600' : 'border-fg/40'}`}
      >
        <Text className={`text-[15px] ${selected ? 'text-fg' : 'text-muted'}`}>
          {selected?.label || placeholder || 'Select...'}
        </Text>
        <Text className="text-fg/40 text-xs">▼</Text>
      </Pressable>

      <Modal visible={open} transparent animationType="fade">
        <Pressable
          className="flex-1 justify-end"
          style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
          onPress={() => setOpen(false)}
        >
          <Pressable onPress={() => {}}>
            <View className="bg-surface rounded-t-xl overflow-hidden">
              <View className="px-5 py-4 border-b border-fg/10">
                <Text className="font-mono text-[13px] uppercase tracking-[2px] text-fg">
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
                    className={`px-5 py-4 border-b border-fg/10 ${value === option.value ? 'bg-yellow/30' : 'bg-surface'}`}
                  >
                    <Text className={`text-[16px] text-fg ${value === option.value ? 'font-bold' : ''}`}>
                      {option.label}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {error && (
        <Text className="text-[11px] text-red-600 font-semibold">{error}</Text>
      )}
    </View>
  )
}
