import React from 'react'
import { View, Text, ScrollView, Image, Pressable, Alert, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { usePets } from '@/contexts/PetContext'
import { calcAge, formatDate } from '@/lib/utils'
import { colors, brutShadow, brutShadowSm, brutShadowSubtle } from '@/lib/theme'
import { hapticTap } from '@/lib/haptics'

const speciesEmoji: Record<string, string> = {
  dog: '🐶',
  cat: '🐱',
  rabbit: '🐰',
  other: '🐾',
}

interface DetailRowProps {
  icon: keyof typeof Ionicons.glyphMap
  label: string
  value: string
}

function DetailRow({ icon, label, value }: DetailRowProps) {
  return (
    <View className="flex-row items-center py-3.5 border-b border-fg/8">
      <Ionicons name={icon} size={18} color={colors.muted} style={{ width: 28 }} />
      <Text className="text-[13px] text-muted flex-1">{label}</Text>
      <Text className="text-[14px] font-semibold text-fg">{value}</Text>
    </View>
  )
}

export default function ProfilePage() {
  const { activePet, isLoaded, getLogsFor } = usePets()

  if (!isLoaded) {
    return (
      <View className="flex-1 items-center justify-center bg-bg">
        <ActivityIndicator size="large" color={colors.fg} />
      </View>
    )
  }

  if (!activePet) return null

  const logs = getLogsFor(activePet.id)
  const latestWeight = [...logs]
    .filter((l) => l.type === 'weight' && l.data?.weight)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]

  const totalLogs = logs.length

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={['top']}>
      <ScrollView
        className="flex-1"
        contentContainerClassName="pb-28"
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Hero */}
        <View className="items-center pt-6 pb-5 px-5">
          <View
            className="w-28 h-28 rounded-2xl items-center justify-center overflow-hidden border-[3px] border-fg bg-yellow"
            style={brutShadow}
          >
            {activePet.photoUrl ? (
              <Image
                source={{ uri: activePet.photoUrl }}
                className="w-full h-full"
                resizeMode="cover"
              />
            ) : (
              <Text className="text-[56px]">{speciesEmoji[activePet.species] ?? '🐾'}</Text>
            )}
          </View>
          <Text className="font-mono text-[32px] uppercase tracking-[2px] text-fg mt-4 leading-tight">
            {activePet.name}
          </Text>
          <Text className="text-[15px] text-muted mt-1">
            {activePet.breed}
          </Text>

          {/* Quick stats pills */}
          <View className="flex-row gap-2 mt-4">
            <View className="px-3.5 py-1.5 bg-green/20 rounded-md border-[1.5px] border-fg/15">
              <Text className="text-[12px] font-bold text-fg">{calcAge(activePet.birthday)}</Text>
            </View>
            <View className="px-3.5 py-1.5 bg-blue/20 rounded-md border-[1.5px] border-fg/15">
              <Text className="text-[12px] font-bold text-fg capitalize">{activePet.sex}</Text>
            </View>
            <View className="px-3.5 py-1.5 bg-pink/20 rounded-md border-[1.5px] border-fg/15">
              <Text className="text-[12px] font-bold text-fg capitalize">{activePet.size}</Text>
            </View>
            <View className="px-3.5 py-1.5 bg-yellow/30 rounded-md border-[1.5px] border-fg/15">
              <Text className="text-[12px] font-bold text-fg">{totalLogs} logs</Text>
            </View>
          </View>
        </View>

        {/* Details Card */}
        <View className="px-5 mt-2">
          <Text className="font-mono text-[11px] uppercase tracking-[2px] text-muted mb-3">
            Details
          </Text>
          <View
            className="bg-surface border-[2.5px] border-fg rounded-md px-4"
            style={brutShadowSm}
          >
            <DetailRow
              icon="calendar-outline"
              label="Birthday"
              value={formatDate(activePet.birthday)}
            />
            <DetailRow
              icon="time-outline"
              label="Age"
              value={calcAge(activePet.birthday)}
            />
            <DetailRow
              icon="male-female-outline"
              label="Sex"
              value={activePet.sex === 'male' ? 'Male' : 'Female'}
            />
            <DetailRow
              icon="resize-outline"
              label="Size"
              value={activePet.size.charAt(0).toUpperCase() + activePet.size.slice(1)}
            />
            <DetailRow
              icon="color-palette-outline"
              label="Color"
              value={activePet.color}
            />
            {latestWeight && (
              <DetailRow
                icon="fitness-outline"
                label="Weight"
                value={`${latestWeight.data!.weight} ${latestWeight.data!.weightUnit ?? 'kg'}`}
              />
            )}
            {activePet.vetClinic && (
              <View className="flex-row items-center py-3.5">
                <Ionicons name="medical-outline" size={18} color={colors.muted} style={{ width: 28 }} />
                <Text className="text-[13px] text-muted flex-1">Vet Clinic</Text>
                <Text className="text-[14px] font-semibold text-fg">{activePet.vetClinic}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Tracking Config */}
        <View className="px-5 mt-6">
          <Text className="font-mono text-[11px] uppercase tracking-[2px] text-muted mb-3">
            Tracking
          </Text>
          <View
            className="bg-surface border-[2.5px] border-fg rounded-md px-4 py-1"
            style={brutShadowSm}
          >
            {[
              { key: 'vaccinations' as const, label: 'Vaccinations', icon: 'medkit-outline' as const },
              { key: 'deworming' as const, label: 'Deworming', icon: 'bug-outline' as const },
              { key: 'fleaTick' as const, label: 'Flea & Tick', icon: 'shield-outline' as const },
              { key: 'weight' as const, label: 'Weight', icon: 'fitness-outline' as const },
              { key: 'symptoms' as const, label: 'Symptoms', icon: 'alert-circle-outline' as const },
            ].map((item, index) => (
              <View
                key={item.key}
                className={`flex-row items-center py-3 ${index > 0 ? 'border-t border-fg/8' : ''}`}
              >
                <Ionicons name={item.icon} size={18} color={colors.muted} style={{ width: 28 }} />
                <Text className="text-[14px] text-fg flex-1">{item.label}</Text>
                <View
                  className="w-5 h-5 rounded items-center justify-center"
                  style={{
                    backgroundColor: activePet.trackingConfig[item.key]
                      ? colors.green
                      : colors.muted + '30',
                  }}
                >
                  {activePet.trackingConfig[item.key] && (
                    <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                  )}
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* App Info */}
        <View className="px-5 mt-6 items-center">
          <Text className="font-mono text-[11px] uppercase tracking-[2px] text-muted">
            PawTrack v1.0
          </Text>
          <Text className="text-[12px] text-muted/60 mt-1">
            Made with love for {activePet.name}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
