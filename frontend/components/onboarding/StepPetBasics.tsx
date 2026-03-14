import React from 'react'
import { View, Text, Pressable } from 'react-native'
import { Species } from '@/lib/types'
import { brutShadowSubtle, colors } from '@/lib/theme'
import { hapticTap } from '@/lib/haptics'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Button from '@/components/ui/Button'

interface StepPetBasicsProps {
  data: { name: string; species: Species; breed: string }
  onChange: (data: { name: string; species: Species; breed: string }) => void
  onNext: () => void
  onBack: () => void
}

const speciesOptions: { value: Species; label: string; emoji: string }[] = [
  { value: 'dog', label: 'Dog', emoji: '🐶' },
  { value: 'cat', label: 'Cat', emoji: '🐱' },
  { value: 'rabbit', label: 'Rabbit', emoji: '🐰' },
  { value: 'other', label: 'Other', emoji: '🐾' },
]

const breedOptions: Record<Species, string[]> = {
  dog: ['Mixed', 'Labrador', 'Golden Retriever', 'Bulldog', 'Poodle', 'Beagle', 'German Shepherd', 'Other'],
  cat: ['Mixed', 'Domestic Shorthair', 'Persian', 'Maine Coon', 'Siamese', 'Ragdoll', 'Bengal', 'Other'],
  rabbit: ['Mixed', 'Holland Lop', 'Mini Rex', 'Lionhead', 'Dutch', 'Flemish Giant', 'Other'],
  other: ['Other'],
}

export default function StepPetBasics({ data, onChange, onNext, onBack }: StepPetBasicsProps) {
  const isValid = data.name.trim().length > 0 && data.species && data.breed

  return (
    <View className="gap-7">
      <View>
        <Text className="font-mono text-xl uppercase tracking-[2px] text-fg mb-1">Meet your pet</Text>
        <Text className="text-muted text-sm">Tell us a little about them.</Text>
      </View>

      {/* Species chips */}
      <View className="gap-2">
        <Text className="font-mono uppercase text-[11px] tracking-[1.5px] text-fg">Species</Text>
        <View className="flex-row flex-wrap gap-2">
          {speciesOptions.map((s) => (
            <Pressable
              key={s.value}
              onPress={() => {
                hapticTap()
                onChange({ ...data, species: s.value, breed: '' })
              }}
            >
              <View
                className="flex-row items-center gap-2 px-4 py-2.5 border-[1.5px] rounded-lg"
                style={[
                  {
                    backgroundColor: data.species === s.value ? colors.accent : colors.surface,
                    borderColor: data.species === s.value ? colors.accent : 'rgba(26,26,26,0.3)',
                  },
                  data.species === s.value ? brutShadowSubtle : undefined,
                ]}
              >
                <Text>{s.emoji}</Text>
                <Text
                  className={`text-[14px] font-semibold ${data.species === s.value ? 'text-white' : 'text-fg'}`}
                >
                  {s.label}
                </Text>
              </View>
            </Pressable>
          ))}
        </View>
      </View>

      <Input
        label="Pet Name"
        placeholder="Buddy, Luna, Charlie..."
        value={data.name}
        onChange={(text) => onChange({ ...data, name: text })}
      />

      {data.species && (
        <Select
          label="Breed"
          placeholder="Select breed..."
          value={data.breed}
          options={breedOptions[data.species].map((b) => ({ value: b, label: b }))}
          onChange={(value) => onChange({ ...data, breed: value })}
        />
      )}

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
