import React from 'react'
import { View, Text, Image } from 'react-native'
import { Pet } from '@/lib/types'
import { calcAge } from '@/lib/utils'
import { brutShadow } from '@/lib/theme'

const speciesEmoji: Record<string, string> = {
  dog: '🐶',
  cat: '🐱',
  rabbit: '🐰',
  other: '🐾',
}

export default function PetCard({ pet }: { pet: Pet }) {
  return (
    <View
      className="bg-surface border-[2.5px] border-fg rounded-md p-6"
      style={brutShadow}
    >
      <View className="flex-row items-center gap-4">
        <View
          className="w-20 h-20 bg-yellow rounded-lg items-center justify-center overflow-hidden"
        >
          {pet.photoUrl ? (
            <Image source={{ uri: pet.photoUrl }} className="w-full h-full" resizeMode="cover" />
          ) : (
            <Text className="text-4xl">{speciesEmoji[pet.species] ?? '🐾'}</Text>
          )}
        </View>
        <View className="flex-1">
          <Text className="font-mono text-2xl uppercase tracking-[2px] leading-none text-fg">
            {pet.name}
          </Text>
          <Text className="text-muted text-sm mt-1" numberOfLines={1}>
            {pet.breed} · {calcAge(pet.birthday)}
          </Text>
          <View className="flex-row flex-wrap gap-2 mt-2">
            <View className="px-2.5 py-1 bg-fg/8 rounded-md">
              <Text className="text-[11px] font-semibold text-fg capitalize">
                {pet.sex}
              </Text>
            </View>
            <View className="px-2.5 py-1 bg-fg/8 rounded-md">
              <Text className="text-[11px] font-semibold text-fg capitalize">
                {pet.size}
              </Text>
            </View>
          </View>
        </View>
      </View>
      {pet.vetClinic && (
        <View className="mt-4 pt-3 border-t border-fg/15">
          <Text className="text-[10px] font-semibold text-muted uppercase tracking-wide">
            Vet Clinic
          </Text>
          <Text className="text-sm text-fg">{pet.vetClinic}</Text>
        </View>
      )}
    </View>
  )
}
