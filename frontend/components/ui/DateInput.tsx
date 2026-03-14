import React, { useState } from 'react'
import { View, Text, Pressable, Platform } from 'react-native'
import DateTimePicker from '@react-native-community/datetimepicker'
import { Ionicons } from '@expo/vector-icons'
import { formatDate } from '@/lib/utils'
import { colors } from '@/lib/theme'
import { hapticSelect } from '@/lib/haptics'

interface DateInputProps {
  label?: string
  value: string
  onChange: (date: string) => void
  maximumDate?: Date
}

export default function DateInput({
  label,
  value,
  onChange,
  maximumDate,
}: DateInputProps) {
  const [show, setShow] = useState(false)
  const dateValue = value ? new Date(value + 'T00:00:00') : new Date()

  return (
    <View className="gap-2">
      {label && (
        <Text className="text-[13px] font-semibold text-muted">{label}</Text>
      )}
      <Pressable
        onPress={() => {
          hapticSelect()
          setShow(true)
        }}
        style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
        className="bg-field-bg border border-fg/[0.06] rounded-lg px-4 py-3.5 flex-row items-center justify-between"
      >
        <Text
          className={`text-[15px] ${value ? 'text-fg' : 'text-muted'}`}
        >
          {value ? formatDate(value) : 'Select date...'}
        </Text>
        <Ionicons name="calendar-outline" size={18} color={colors.muted} />
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
