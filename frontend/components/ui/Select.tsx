import React, { useState } from 'react'
import { View, Text, Pressable, Modal, ScrollView } from 'react-native'
import { brutShadow, colors } from '@/lib/theme'

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
        onPress={() => setOpen(true)}
        style={brutShadow}
        className={`bg-surface border-[2.5px] rounded-[3px] px-3.5 py-2.5 flex-row items-center justify-between ${error ? 'border-red-600' : 'border-fg'}`}
      >
        <Text className={`text-[15px] ${selected ? 'text-fg' : 'text-muted'}`}>
          {selected?.label || placeholder || 'Select...'}
        </Text>
        <Text className="text-fg text-xs">▼</Text>
      </Pressable>

      <Modal visible={open} transparent animationType="fade">
        <Pressable
          className="flex-1 justify-end"
          style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
          onPress={() => setOpen(false)}
        >
          <Pressable onPress={() => {}}>
            <View className="bg-surface border-t-[2.5px] border-fg">
              <View className="bg-fg px-4 py-3">
                <Text className="font-mono text-[13px] uppercase tracking-[2px] text-bg">
                  {label || 'Select'}
                </Text>
              </View>
              <ScrollView style={{ maxHeight: 320 }}>
                {options.map((option) => (
                  <Pressable
                    key={option.value}
                    onPress={() => {
                      onChange(option.value)
                      setOpen(false)
                    }}
                    className={`px-4 py-3.5 border-b border-fg/10 ${value === option.value ? 'bg-yellow' : 'bg-surface'}`}
                  >
                    <Text className={`text-[15px] text-fg ${value === option.value ? 'font-bold' : ''}`}>
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
        <Text className="text-[11px] text-red-600 font-mono uppercase tracking-wider">{error}</Text>
      )}
    </View>
  )
}
