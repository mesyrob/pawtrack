import React from 'react'
import {
  View,
  Text,
  ScrollView,
  Image,
  ActivityIndicator,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { usePets } from '@/contexts/PetContext'
import { calcAge, formatDate } from '@/lib/utils'
import { colors, shadow, shadowMd } from '@/lib/theme'

const speciesEmoji: Record<string, string> = {
  dog: '\uD83D\uDC36',
  cat: '\uD83D\uDC31',
  rabbit: '\uD83D\uDC30',
  other: '\uD83D\uDC3E',
}

interface DetailRowProps {
  icon: keyof typeof Ionicons.glyphMap
  label: string
  value: string
  isLast?: boolean
}

function DetailRow({ icon, label, value, isLast = false }: DetailRowProps) {
  return (
    <View
      className={`flex-row items-center py-3.5 ${isLast ? '' : 'border-b border-fg/[0.04]'}`}
    >
      <Ionicons
        name={icon}
        size={18}
        color={colors.muted}
        style={{ width: 28 }}
      />
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
    .sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    )[0]

  const totalLogs = logs.length

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={['top']}>
      <ScrollView
        className="flex-1"
        contentContainerClassName="pb-32"
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Hero */}
        <View className="items-center pt-6 pb-5 px-5">
          <View
            className="w-28 h-28 rounded-3xl items-center justify-center overflow-hidden bg-accent/10"
            style={shadowMd}
          >
            {activePet.photoUrl ? (
              <Image
                source={{ uri: activePet.photoUrl }}
                className="w-full h-full"
                resizeMode="cover"
              />
            ) : (
              <Text className="text-[56px]">
                {speciesEmoji[activePet.species] ?? '\uD83D\uDC3E'}
              </Text>
            )}
          </View>
          <Text className="text-[28px] font-bold text-fg mt-4 leading-tight">
            {activePet.name}
          </Text>
          <Text className="text-[15px] text-muted mt-1">
            {activePet.breed}
          </Text>

          {/* Quick stats pills */}
          <View className="flex-row gap-2 mt-4">
            {[
              {
                label: calcAge(activePet.birthday),
                bg: colors.green + '15',
              },
              {
                label: activePet.sex === 'male' ? 'Male' : 'Female',
                bg: colors.blue + '15',
              },
              {
                label:
                  activePet.size.charAt(0).toUpperCase() +
                  activePet.size.slice(1),
                bg: colors.pink + '15',
              },
              {
                label: `${totalLogs} logs`,
                bg: colors.yellow + '15',
              },
            ].map((pill) => (
              <View
                key={pill.label}
                className="px-3.5 py-1.5 rounded-full"
                style={{ backgroundColor: pill.bg }}
              >
                <Text className="text-[12px] font-semibold text-fg">
                  {pill.label}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Details Card */}
        <View className="px-5 mt-2">
          <Text className="text-xs font-semibold uppercase tracking-wider text-muted mb-3">
            Details
          </Text>
          <View
            className="bg-surface rounded-xl px-4"
            style={shadow}
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
              value={
                activePet.size.charAt(0).toUpperCase() +
                activePet.size.slice(1)
              }
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
              <DetailRow
                icon="medical-outline"
                label="Vet Clinic"
                value={activePet.vetClinic}
                isLast
              />
            )}
          </View>
        </View>

        {/* Tracking Config */}
        <View className="px-5 mt-6">
          <Text className="text-xs font-semibold uppercase tracking-wider text-muted mb-3">
            Tracking
          </Text>
          <View
            className="bg-surface rounded-xl px-4 py-1"
            style={shadow}
          >
            {[
              {
                key: 'vaccinations' as const,
                label: 'Vaccinations',
                icon: 'medkit-outline' as const,
              },
              {
                key: 'deworming' as const,
                label: 'Deworming',
                icon: 'bug-outline' as const,
              },
              {
                key: 'fleaTick' as const,
                label: 'Flea & Tick',
                icon: 'shield-outline' as const,
              },
              {
                key: 'weight' as const,
                label: 'Weight',
                icon: 'fitness-outline' as const,
              },
              {
                key: 'symptoms' as const,
                label: 'Symptoms',
                icon: 'alert-circle-outline' as const,
              },
            ].map((item, index) => (
              <View
                key={item.key}
                className={`flex-row items-center py-3 ${index > 0 ? 'border-t border-fg/[0.04]' : ''}`}
              >
                <Ionicons
                  name={item.icon}
                  size={18}
                  color={colors.muted}
                  style={{ width: 28 }}
                />
                <Text className="text-[14px] text-fg flex-1">
                  {item.label}
                </Text>
                <View
                  className="w-5 h-5 rounded-full items-center justify-center"
                  style={{
                    backgroundColor: activePet.trackingConfig[item.key]
                      ? colors.green
                      : colors.muted + '20',
                  }}
                >
                  {activePet.trackingConfig[item.key] && (
                    <Ionicons name="checkmark" size={13} color="#FFFFFF" />
                  )}
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* App Info */}
        <View className="px-5 mt-8 items-center">
          <Text className="text-[11px] font-medium text-muted/60">
            PawTrack v1.0
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
