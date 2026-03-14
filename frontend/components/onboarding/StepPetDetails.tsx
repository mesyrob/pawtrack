import React from 'react'
import { View, Text, Pressable, TextInput } from 'react-native'
import { Sex, PetSize } from '@/lib/types'
import { shadow, colors } from '@/lib/theme'
import { hapticTap } from '@/lib/haptics'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import DateInput from '@/components/ui/DateInput'
import Button from '@/components/ui/Button'

interface PetDetails {
  birthday: string
  sex: Sex | ''
  size: PetSize | ''
  weight: string
  weightUnit: 'kg' | 'lbs'
  color: string
}

interface StepPetDetailsProps {
  data: PetDetails
  onChange: (data: PetDetails) => void
  onNext: () => void
  onBack: () => void
}

const sexOptions = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
]

const sizeOptions = [
  { value: 'small', label: 'Small (< 10kg)' },
  { value: 'medium', label: 'Medium (10–25kg)' },
  { value: 'large', label: 'Large (> 25kg)' },
]

export default function StepPetDetails({ data, onChange, onNext, onBack }: StepPetDetailsProps) {
  const isValid = data.birthday && data.sex && data.size && data.color.trim()

  return (
    <View className="gap-6">
      <View>
        <Text className="text-xl font-bold text-fg mb-1">Pet details</Text>
        <Text className="text-muted text-sm">A few more details to personalise tracking.</Text>
      </View>

      <DateInput
        label="Birthday"
        value={data.birthday}
        onChange={(date) => onChange({ ...data, birthday: date })}
        maximumDate={new Date()}
      />

      <View className="flex-row gap-4">
        <View className="flex-1">
          <Select
            label="Sex"
            placeholder="Select..."
            value={data.sex}
            options={sexOptions}
            onChange={(value) => onChange({ ...data, sex: value as Sex })}
          />
        </View>
        <View className="flex-1">
          <Select
            label="Size"
            placeholder="Select..."
            value={data.size}
            options={sizeOptions}
            onChange={(value) => onChange({ ...data, size: value as PetSize })}
          />
        </View>
      </View>

      {/* Weight with unit toggle */}
      <View className="gap-1.5">
        <Text className="text-[13px] font-semibold text-muted">Current Weight (optional)</Text>
        <View className="flex-row gap-2">
          <View className="flex-1">
            <TextInput
              keyboardType="decimal-pad"
              placeholder="0.0"
              value={data.weight}
              onChangeText={(text) => onChange({ ...data, weight: text })}
              placeholderTextColor={colors.muted}
              className="bg-surface border border-fg/[0.06] rounded-xl px-3.5 py-3 text-[15px] text-fg"
              style={shadow}
            />
          </View>
          <View className="flex-row bg-fg/5 rounded-xl overflow-hidden">
            {(['kg', 'lbs'] as const).map((u) => (
              <Pressable
                key={u}
                onPress={() => {
                  hapticTap()
                  onChange({ ...data, weightUnit: u })
                }}
                className={`px-5 justify-center rounded-xl ${data.weightUnit === u ? 'bg-fg' : ''}`}
              >
                <Text className={`text-[13px] font-semibold ${data.weightUnit === u ? 'text-bg' : 'text-fg/50'}`}>
                  {u}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      </View>

      <Input
        label="Coat Color"
        placeholder="e.g. Black & white, Golden, Tabby..."
        value={data.color}
        onChange={(text) => onChange({ ...data, color: text })}
      />

      <View className="flex-row gap-3 mt-2">
        <Button variant="ghost" onPress={onBack}>← Back</Button>
        <View className="flex-1">
          <Button variant="accent" fullWidth onPress={onNext} disabled={!isValid}>
            Continue
          </Button>
        </View>
      </View>
    </View>
  )
}
