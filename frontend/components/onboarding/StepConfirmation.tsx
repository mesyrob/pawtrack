import React from 'react'
import { View, Text } from 'react-native'
import { Pet } from '@/lib/types'
import { calcAge } from '@/lib/utils'
import { brutShadow, brutShadowSm } from '@/lib/theme'
import Button from '@/components/ui/Button'

interface StepConfirmationProps {
  pet: Omit<Pet, 'id' | 'createdAt'>
  onConfirm: () => void
  onBack: () => void
}

const speciesEmoji: Record<string, string> = {
  dog: '🐶',
  cat: '🐱',
  rabbit: '🐰',
  other: '🐾',
}

export default function StepConfirmation({ pet, onConfirm, onBack }: StepConfirmationProps) {
  const trackingOn = Object.entries(pet.trackingConfig)
    .filter(([, v]) => v)
    .map(([k]) => k.replace(/([A-Z])/g, ' $1').trim())

  return (
    <View className="gap-6">
      <View>
        <Text className="font-mono text-xl uppercase tracking-[2px] text-fg mb-1">Looks good?</Text>
        <Text className="text-muted text-sm">
          Review your pet's profile before saving.
        </Text>
      </View>

      {/* Pet card */}
      <View className="bg-surface border-[2.5px] border-fg rounded-[3px] p-5 gap-4" style={brutShadow}>
        <View className="flex-row items-center gap-4">
          <View
            className="w-16 h-16 border-2 border-fg bg-yellow rounded-[4px] items-center justify-center"
            style={brutShadowSm}
          >
            <Text className="text-3xl">{speciesEmoji[pet.species] ?? '🐾'}</Text>
          </View>
          <View>
            <Text className="font-mono text-2xl uppercase tracking-[2px] text-fg">{pet.name}</Text>
            <Text className="text-muted text-sm">
              {pet.breed} · {calcAge(pet.birthday)} old
            </Text>
          </View>
        </View>

        <View className="border-t-2 border-fg pt-4">
          <View className="flex-row flex-wrap gap-x-8 gap-y-3">
            {([
              ['Sex', pet.sex],
              ['Size', pet.size],
              ['Color', pet.color],
              ['Vet', pet.vetClinic || '—'],
            ] as const).map(([k, v]) => (
              <View key={k}>
                <Text className="font-mono uppercase text-[9px] tracking-[1.5px] text-muted">{k}</Text>
                <Text className="text-sm text-fg capitalize">{v}</Text>
              </View>
            ))}
          </View>
        </View>

        {trackingOn.length > 0 && (
          <View className="border-t-2 border-fg pt-3">
            <Text className="font-mono uppercase text-[9px] tracking-[1.5px] text-muted mb-2">Tracking</Text>
            <View className="flex-row flex-wrap gap-2">
              {trackingOn.map((t) => (
                <View key={t} className="px-2 py-1 bg-green border border-fg rounded-[2px]">
                  <Text className="font-mono uppercase text-[9px] tracking-[1.5px] text-fg">{t}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </View>

      <View className="flex-row gap-3 mt-2">
        <Button variant="ghost" onPress={onBack}>← Edit</Button>
        <View className="flex-1">
          <Button variant="accent" fullWidth onPress={onConfirm}>Save Pet 🐾</Button>
        </View>
      </View>
    </View>
  )
}
