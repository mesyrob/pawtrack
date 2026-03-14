import React from 'react'
import { View, Text, Pressable, TextInput } from 'react-native'
import { Sex, PetSize } from '@/lib/types'
import { brutShadow, brutShadowSm, colors } from '@/lib/theme'
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
        <Text className="font-mono text-xl uppercase tracking-[2px] text-fg mb-1">Pet details</Text>
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
        <Text className="font-mono uppercase text-[11px] tracking-[1.5px] text-fg">Current Weight (optional)</Text>
        <View className="flex-row gap-2">
          <View className="flex-1">
            <TextInput
              keyboardType="decimal-pad"
              placeholder="0.0"
              value={data.weight}
              onChangeText={(text) => onChange({ ...data, weight: text })}
              placeholderTextColor={colors.muted}
              className="bg-surface border-[2.5px] border-fg rounded-[3px] px-3.5 py-2.5 text-[15px] text-fg"
              style={brutShadow}
            />
          </View>
          <View className="flex-row border-2 border-fg rounded-[3px] overflow-hidden" style={brutShadowSm}>
            {(['kg', 'lbs'] as const).map((u) => (
              <Pressable
                key={u}
                onPress={() => onChange({ ...data, weightUnit: u })}
                className={`px-4 justify-center ${data.weightUnit === u ? 'bg-fg' : 'bg-surface'}`}
              >
                <Text className={`font-mono uppercase text-[11px] tracking-wider ${data.weightUnit === u ? 'text-bg' : 'text-fg'}`}>
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
            Continue →
          </Button>
        </View>
      </View>
    </View>
  )
}
