import React, { useMemo } from 'react'
import { View, Text, ScrollView, Pressable, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { usePets } from '@/contexts/PetContext'
import { LogEntry, Pet } from '@/lib/types'
import { daysSince, formatDate } from '@/lib/utils'
import { colors, brutShadow, brutShadowSm, brutShadowSubtle } from '@/lib/theme'
import { hapticTap } from '@/lib/haptics'
import ProgressBar from '@/components/ui/ProgressBar'

interface HealthItem {
  key: string
  label: string
  icon: keyof typeof Ionicons.glyphMap
  urgency: 'ok' | 'soon' | 'overdue'
  lastDate?: string
  daysAgo?: number
  daysUntilDue: number
  cycleDays: number
}

function buildHealthItems(pet: Pet, logs: LogEntry[]): HealthItem[] {
  const items: HealthItem[] = []

  const lastLog = (type: string) =>
    logs
      .filter((l) => l.type === type)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]

  if (pet.trackingConfig.vaccinations) {
    const last = lastLog('vaccination')
    const daysAgo = last ? daysSince(last.date) : Infinity
    const cycleDays = 365
    items.push({
      key: 'vaccination',
      label: 'Vaccination',
      icon: 'medkit-outline',
      urgency: daysAgo === Infinity ? 'overdue' : daysAgo > cycleDays ? 'overdue' : daysAgo > cycleDays - 65 ? 'soon' : 'ok',
      lastDate: last?.date,
      daysAgo: last ? daysAgo : undefined,
      daysUntilDue: last ? Math.max(0, cycleDays - daysAgo) : 0,
      cycleDays,
    })
  }

  if (pet.trackingConfig.deworming) {
    const last = lastLog('deworming')
    const daysAgo = last ? daysSince(last.date) : Infinity
    const cycleDays = 90
    items.push({
      key: 'deworming',
      label: 'Deworming',
      icon: 'bug-outline',
      urgency: daysAgo === Infinity ? 'overdue' : daysAgo > cycleDays ? 'overdue' : daysAgo > cycleDays - 15 ? 'soon' : 'ok',
      lastDate: last?.date,
      daysAgo: last ? daysAgo : undefined,
      daysUntilDue: last ? Math.max(0, cycleDays - daysAgo) : 0,
      cycleDays,
    })
  }

  if (pet.trackingConfig.fleaTick) {
    const last = lastLog('flea_tick')
    const daysAgo = last ? daysSince(last.date) : Infinity
    const cycleDays = 30
    items.push({
      key: 'flea_tick',
      label: 'Flea & Tick',
      icon: 'shield-outline',
      urgency: daysAgo === Infinity ? 'overdue' : daysAgo > cycleDays ? 'overdue' : daysAgo > cycleDays - 5 ? 'soon' : 'ok',
      lastDate: last?.date,
      daysAgo: last ? daysAgo : undefined,
      daysUntilDue: last ? Math.max(0, cycleDays - daysAgo) : 0,
      cycleDays,
    })
  }

  if (pet.trackingConfig.weight) {
    const last = lastLog('weight')
    const daysAgo = last ? daysSince(last.date) : Infinity
    const cycleDays = 30
    items.push({
      key: 'weight',
      label: 'Weight Check',
      icon: 'fitness-outline',
      urgency: daysAgo === Infinity ? 'soon' : daysAgo > cycleDays ? 'soon' : 'ok',
      lastDate: last?.date,
      daysAgo: last ? daysAgo : undefined,
      daysUntilDue: last ? Math.max(0, cycleDays - daysAgo) : 0,
      cycleDays,
    })
  }

  return items
}

function getHealthScore(items: HealthItem[]): number {
  if (items.length === 0) return 100
  const scores = items.map((i) =>
    i.urgency === 'ok' ? 100 : i.urgency === 'soon' ? 60 : 20
  )
  return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
}

const urgencyColor = {
  ok: colors.green,
  soon: colors.yellow,
  overdue: colors.accent,
}

const urgencyLabel = {
  ok: 'On Track',
  soon: 'Due Soon',
  overdue: 'Overdue',
}

function HealthCard({ item }: { item: HealthItem }) {
  const router = useRouter()
  const color = urgencyColor[item.urgency]
  const progress = item.lastDate
    ? Math.min(1, (item.cycleDays - (item.daysUntilDue)) / item.cycleDays)
    : 1

  return (
    <Pressable
      onPress={() => {
        hapticTap()
        router.push('/log')
      }}
    >
      {({ pressed }) => (
        <View
          className="bg-surface border-[2px] border-fg rounded-md p-4"
          style={pressed ? brutShadowSubtle : brutShadowSm}
        >
          <View className="flex-row items-center justify-between mb-3">
            <View className="flex-row items-center gap-3">
              <View
                className="w-10 h-10 rounded-lg items-center justify-center border-[2px] border-fg"
                style={{ backgroundColor: color + '25' }}
              >
                <Ionicons name={item.icon} size={20} color={colors.fg} />
              </View>
              <View>
                <Text className="font-semibold text-[15px] text-fg">{item.label}</Text>
                <Text className="text-[12px] text-muted">
                  {item.lastDate
                    ? `Last: ${formatDate(item.lastDate)}`
                    : 'No record yet'}
                </Text>
              </View>
            </View>
            <View
              className="px-2.5 py-1 rounded-md"
              style={{ backgroundColor: color + '20' }}
            >
              <Text className="text-[11px] font-bold" style={{ color }}>
                {urgencyLabel[item.urgency]}
              </Text>
            </View>
          </View>

          {/* Progress bar */}
          <View className="h-2.5 bg-fg/8 rounded-full overflow-hidden">
            <View
              className="h-full rounded-full"
              style={{
                width: `${progress * 100}%`,
                backgroundColor: color,
              }}
            />
          </View>

          {item.daysUntilDue > 0 && (
            <Text className="text-[11px] text-muted mt-1.5">
              {item.daysUntilDue} days until next is due
            </Text>
          )}
          {item.daysUntilDue === 0 && item.lastDate && (
            <Text className="text-[11px] font-semibold mt-1.5" style={{ color: colors.accent }}>
              Due now - tap to log
            </Text>
          )}
          {!item.lastDate && (
            <Text className="text-[11px] font-semibold mt-1.5" style={{ color: colors.accent }}>
              Tap to add first record
            </Text>
          )}
        </View>
      )}
    </Pressable>
  )
}

export default function HealthPage() {
  const { activePet, isLoaded, getLogsFor } = usePets()
  const router = useRouter()

  const healthItems = useMemo(() => {
    if (!activePet) return []
    return buildHealthItems(activePet, getLogsFor(activePet.id))
  }, [activePet, getLogsFor])

  const score = useMemo(() => getHealthScore(healthItems), [healthItems])

  const scoreColor = score >= 80 ? colors.green : score >= 50 ? colors.yellow : colors.accent
  const okCount = healthItems.filter((i) => i.urgency === 'ok').length
  const actionCount = healthItems.filter((i) => i.urgency !== 'ok').length

  if (!isLoaded) {
    return (
      <View className="flex-1 items-center justify-center bg-bg">
        <ActivityIndicator size="large" color={colors.fg} />
      </View>
    )
  }

  if (!activePet) return null

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={['top']}>
      {/* Header */}
      <View className="px-5 pt-3 pb-2">
        <Text className="text-muted text-[13px] font-semibold">{activePet.name}'s</Text>
        <Text className="font-mono text-[28px] uppercase tracking-[1px] text-fg leading-tight">
          Health
        </Text>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerClassName="px-5 pt-2 gap-4 pb-28"
        showsVerticalScrollIndicator={false}
      >
        {/* Health Score Card */}
        <View
          className="border-[2.5px] border-fg rounded-md overflow-hidden"
          style={brutShadow}
        >
          <View className="p-5" style={{ backgroundColor: scoreColor + '15' }}>
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="font-mono text-[48px] text-fg leading-none">
                  {score}
                </Text>
                <Text className="text-[12px] font-semibold text-muted uppercase tracking-wide mt-1">
                  Health Score
                </Text>
              </View>
              <View className="items-end">
                {actionCount > 0 ? (
                  <>
                    <View className="flex-row items-center gap-1.5 mb-1">
                      <View className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: colors.accent }} />
                      <Text className="text-[13px] font-semibold text-fg">
                        {actionCount} need{actionCount === 1 ? 's' : ''} attention
                      </Text>
                    </View>
                    <View className="flex-row items-center gap-1.5">
                      <View className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: colors.green }} />
                      <Text className="text-[13px] text-muted">
                        {okCount} on track
                      </Text>
                    </View>
                  </>
                ) : (
                  <View className="flex-row items-center gap-2">
                    <Ionicons name="checkmark-circle" size={24} color={colors.green} />
                    <Text className="text-[15px] font-semibold text-fg">All caught up!</Text>
                  </View>
                )}
              </View>
            </View>

            {/* Progress bar */}
            <View className="mt-4 h-3 bg-fg/10 rounded-full overflow-hidden">
              <View
                className="h-full rounded-full"
                style={{ width: `${score}%`, backgroundColor: scoreColor }}
              />
            </View>
          </View>
        </View>

        {/* Section Label */}
        <Text className="font-mono text-[11px] uppercase tracking-[2px] text-muted mt-2">
          Tracking Items
        </Text>

        {/* Health Cards */}
        {healthItems.map((item) => (
          <HealthCard key={item.key} item={item} />
        ))}

        {healthItems.length === 0 && (
          <View className="items-center py-10">
            <Text className="text-[14px] text-muted text-center">
              No health items being tracked.
            </Text>
          </View>
        )}

        {/* Quick Actions */}
        <Text className="font-mono text-[11px] uppercase tracking-[2px] text-muted mt-2">
          Quick Actions
        </Text>
        <View className="flex-row gap-3">
          {[
            { label: 'Log Weight', icon: 'fitness-outline' as const, color: colors.blue },
            { label: 'Vet Visit', icon: 'medkit-outline' as const, color: colors.accent },
            { label: 'Add Note', icon: 'create-outline' as const, color: colors.muted },
          ].map((action) => (
            <Pressable
              key={action.label}
              onPress={() => {
                hapticTap()
                router.push('/log')
              }}
              className="flex-1"
            >
              <View
                className="items-center py-4 border-[2px] border-fg rounded-md bg-surface"
                style={brutShadowSubtle}
              >
                <Ionicons name={action.icon} size={22} color={action.color} />
                <Text className="text-[11px] font-semibold text-fg mt-1.5">{action.label}</Text>
              </View>
            </Pressable>
          ))}
        </View>

        <View className="h-4" />
      </ScrollView>
    </SafeAreaView>
  )
}
