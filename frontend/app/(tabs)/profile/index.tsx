import React from 'react'
import {
  View,
  Text,
  ScrollView,
  Image,
  ActivityIndicator,
} from 'react-native'
import { Stack } from 'expo-router'
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
      className={`flex-row items-center py-3.5 ${isLast ? '' : 'border-b-[2px] border-fg/[0.06]'}`}
    >
      <Ionicons
        name={icon}
        size={18}
        color={colors.muted}
        style={{ width: 28 }}
      />
      <Text className="text-[13px] text-muted flex-1">{label}</Text>
      <Text className="font-mono text-[13px] text-fg">{value}</Text>
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

  const statPills = [
    { label: calcAge(activePet.birthday), bg: colors.green + '15' },
    { label: activePet.sex === 'male' ? 'Male' : 'Female', bg: colors.blue + '15' },
    { label: activePet.size.charAt(0).toUpperCase() + activePet.size.slice(1), bg: colors.pink + '15' },
    { label: `${totalLogs} logs`, bg: colors.yellow + '15' },
  ]

  return (
    <>
      <Stack.Screen
        options={{
          title: activePet.name,
          headerLargeTitle: true,
          headerLargeTitleStyle: { color: colors.fg },
          headerStyle: { backgroundColor: colors.bg },
        }}
      />

      <ScrollView
        className="flex-1 bg-bg"
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Hero */}
        <View className="items-center pt-4 pb-2 px-5">
          <View
            className="w-28 h-28 rounded items-center justify-center overflow-hidden bg-accent/10 border-[2.5px] border-fg"
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
          <Text className="text-[15px] text-muted mt-3">
            {activePet.breed}
          </Text>

          {/* Quick stats pills */}
          <View className="flex-row gap-2 mt-4 flex-wrap justify-center">
            {statPills.map((pill) => (
              <View
                key={pill.label}
                className="px-3.5 py-2 border-[2px] border-fg"
                style={[shadow, { backgroundColor: pill.bg }]}
              >
                <Text className="font-mono text-[10px] uppercase tracking-[1px] text-fg">
                  {pill.label}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Details Card */}
        <View className="px-5 mt-6">
          <View className="bg-fg px-4 py-2.5">
            <Text className="font-mono text-[11px] uppercase tracking-[2px] text-bg">
              Details
            </Text>
          </View>
          <View
            className="bg-surface border-[2.5px] border-fg border-t-0 px-4"
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
          <View className="bg-fg px-4 py-2.5">
            <Text className="font-mono text-[11px] uppercase tracking-[2px] text-bg">
              Tracking
            </Text>
          </View>
          <View
            className="bg-surface border-[2.5px] border-fg border-t-0 px-4 py-1"
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
                className={`flex-row items-center py-3.5 ${index > 0 ? 'border-t-[2px] border-fg/[0.06]' : ''}`}
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
                  className="w-6 h-6 rounded-sm items-center justify-center border-[2px] border-fg"
                  style={{
                    backgroundColor: activePet.trackingConfig[item.key]
                      ? colors.green
                      : colors.fieldBg,
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
        <View className="px-5 mt-8 items-center">
          <Text className="font-mono text-[10px] uppercase tracking-[2px] text-muted/40">
            PawTrack v1.0
          </Text>
        </View>
      </ScrollView>
    </>
  )
}
