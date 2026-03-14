import React from 'react'
import { View, Text } from 'react-native'
import { Pet } from '@/lib/types'
import { calcAge } from '@/lib/utils'
import { brutShadow, brutShadowSm, colors } from '@/lib/theme'

const speciesEmoji: Record<string, string> = {
  dog: '🐶',
  cat: '🐱',
  rabbit: '🐰',
  other: '🐾',
}

export default function PetCard({ pet }: { pet: Pet }) {
  return (
    <View
      className="bg-surface border-[2.5px] border-fg rounded-[3px] p-5"
      style={brutShadow}
    >
      <View className="flex-row items-center gap-4">
        <View
          className="w-20 h-20 border-[2.5px] border-fg bg-yellow rounded-[4px] items-center justify-center"
          style={brutShadowSm}
        >
          <Text className="text-4xl">{speciesEmoji[pet.species] ?? '🐾'}</Text>
        </View>
        <View className="flex-1">
          <Text className="font-mono text-2xl uppercase tracking-[2px] leading-none text-fg">
            {pet.name}
          </Text>
          <Text className="text-muted text-sm mt-1" numberOfLines={1}>
            {pet.breed} · {calcAge(pet.birthday)}
          </Text>
          <View className="flex-row flex-wrap gap-2 mt-2">
            <View className="px-2 py-0.5 border border-fg rounded-[2px] bg-bg">
              <Text className="font-mono uppercase text-[9px] tracking-[1.5px] text-fg capitalize">
                {pet.sex}
              </Text>
            </View>
            <View className="px-2 py-0.5 border border-fg rounded-[2px] bg-bg">
              <Text className="font-mono uppercase text-[9px] tracking-[1.5px] text-fg capitalize">
                {pet.size}
              </Text>
            </View>
          </View>
        </View>
      </View>
      {pet.vetClinic && (
        <View className="mt-4 pt-3 border-t-2 border-fg">
          <Text className="font-mono uppercase text-[9px] tracking-[1.5px] text-muted">
            Vet Clinic
          </Text>
          <Text className="text-sm text-fg">{pet.vetClinic}</Text>
        </View>
      )}
    </View>
  )
}
