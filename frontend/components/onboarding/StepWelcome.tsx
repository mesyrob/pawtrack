import React from 'react'
import { View, Text } from 'react-native'
import { shadow, shadowMd } from '@/lib/theme'
import Button from '@/components/ui/Button'

const features = [
  { icon: '💉', label: 'Vaccine tracking', desc: 'Never miss a booster again' },
  { icon: '⚖️', label: 'Weight log', desc: 'Track trends over time' },
  { icon: '🏥', label: 'Vet visits', desc: 'Keep all records in one place' },
  { icon: '💊', label: 'Medications', desc: 'Dosage & schedule reminders' },
]

export default function StepWelcome({ onNext }: { onNext: () => void }) {
  return (
    <View className="gap-10">
      {/* Hero */}
      <View className="items-center">
        <View
          className="w-20 h-20 bg-yellow rounded-2xl items-center justify-center mb-4"
          style={shadowMd}
        >
          <Text className="text-4xl">🐾</Text>
        </View>
        <Text className="text-4xl font-bold text-fg mb-2">
          PawTrack
        </Text>
        <Text className="text-muted text-base text-center">
          The no-nonsense health tracker for your pet.
        </Text>
      </View>

      {/* Feature grid */}
      <View className="gap-3">
        {[features.slice(0, 2), features.slice(2)].map((row, i) => (
          <View key={i} className="flex-row gap-3">
            {row.map((f) => (
              <View
                key={f.label}
                className="flex-1 bg-surface rounded-2xl p-4 gap-1"
                style={shadow}
              >
                <Text className="text-2xl">{f.icon}</Text>
                <Text className="text-[14px] font-bold text-fg">
                  {f.label}
                </Text>
                <Text className="text-[12px] text-muted">{f.desc}</Text>
              </View>
            ))}
          </View>
        ))}
      </View>

      <Button variant="accent" size="lg" fullWidth onPress={onNext}>
        Get Started
      </Button>

      <Text className="text-center text-[12px] text-muted">
        All data stored locally on your device.{'\n'}No account needed.
      </Text>
    </View>
  )
}
