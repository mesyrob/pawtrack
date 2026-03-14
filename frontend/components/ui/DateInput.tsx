import React, { useState } from 'react'
import { View, Text, Pressable, Platform } from 'react-native'
import DateTimePicker from '@react-native-community/datetimepicker'
import { formatDate } from '@/lib/utils'
import { brutShadowSubtle } from '@/lib/theme'
import { hapticSelect } from '@/lib/haptics'

interface DateInputProps {
  label?: string
  value: string // YYYY-MM-DD
  onChange: (date: string) => void
  maximumDate?: Date
}

export default function DateInput({ label, value, onChange, maximumDate }: DateInputProps) {
  const [show, setShow] = useState(false)
  const dateValue = value ? new Date(value + 'T00:00:00') : new Date()

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
          setShow(true)
        }}
        style={brutShadowSubtle}
        className="bg-surface border-[1.5px] border-fg/40 rounded-md px-3.5 py-3"
      >
        <Text className={`text-[15px] ${value ? 'text-fg' : 'text-muted'}`}>
          {value ? formatDate(value) : 'Select date...'}
        </Text>
      </Pressable>
      {show && (
        <DateTimePicker
          value={dateValue}
          mode="date"
          display="default"
          maximumDate={maximumDate}
          onChange={(_, selectedDate) => {
            if (Platform.OS === 'android') setShow(false)
            if (selectedDate) {
              onChange(selectedDate.toISOString().split('T')[0])
              if (Platform.OS === 'ios') setShow(false)
            }
          }}
        />
      )}
    </View>
  )
}
