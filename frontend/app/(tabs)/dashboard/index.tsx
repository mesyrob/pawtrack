import React, { useMemo } from 'react'
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  ActionSheetIOS,
  Platform,
} from 'react-native'
import { Stack } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { usePets } from '@/contexts/PetContext'
import { LogEntry, Pet } from '@/lib/types'
import { daysSince, formatDate, slugToLabel, calcAge } from '@/lib/utils'
import { colors, shadow, shadowMd } from '@/lib/theme'
import { hapticTap } from '@/lib/haptics'
import WalkingDog from '@/components/dashboard/WalkingDog'

// ─── Health Logic ───────────────────────────────────────────────────────────

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
      .sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      )[0]

  if (pet.trackingConfig.vaccinations) {
    const last = lastLog('vaccination')
    const age = last ? daysSince(last.date) : Infinity
    items.push({
      key: 'vaccination',
      label: 'Vaccination',
      icon: 'medkit-outline',
      urgency:
        age === Infinity || age > 365
          ? 'overdue'
          : age > 300
            ? 'soon'
            : 'ok',
      lastDate: last?.date,
      daysAgo: last ? age : undefined,
      daysUntilDue: last ? Math.max(0, 365 - age) : 0,
      cycleDays: 365,
    })
  }

  if (pet.trackingConfig.deworming) {
    const last = lastLog('deworming')
    const age = last ? daysSince(last.date) : Infinity
    items.push({
      key: 'deworming',
      label: 'Deworming',
      icon: 'bug-outline',
      urgency:
        age === Infinity || age > 90 ? 'overdue' : age > 75 ? 'soon' : 'ok',
      lastDate: last?.date,
      daysAgo: last ? age : undefined,
      daysUntilDue: last ? Math.max(0, 90 - age) : 0,
      cycleDays: 90,
    })
  }

  if (pet.trackingConfig.fleaTick) {
    const last = lastLog('flea_tick')
    const age = last ? daysSince(last.date) : Infinity
    items.push({
      key: 'flea_tick',
      label: 'Flea & Tick',
      icon: 'shield-outline',
      urgency:
        age === Infinity || age > 30 ? 'overdue' : age > 25 ? 'soon' : 'ok',
      lastDate: last?.date,
      daysAgo: last ? age : undefined,
      daysUntilDue: last ? Math.max(0, 30 - age) : 0,
      cycleDays: 30,
    })
  }

  if (pet.trackingConfig.weight) {
    const last = lastLog('weight')
    const age = last ? daysSince(last.date) : Infinity
    items.push({
      key: 'weight',
      label: 'Weight Check',
      icon: 'fitness-outline',
      urgency: age === Infinity || age > 30 ? 'soon' : 'ok',
      lastDate: last?.date,
      daysAgo: last ? age : undefined,
      daysUntilDue: last ? Math.max(0, 30 - age) : 0,
      cycleDays: 30,
    })
  }

  return items
}

function getHealthScore(items: HealthItem[]): number {
  if (items.length === 0) return 100
  const scores = items.map((i) =>
    i.urgency === 'ok' ? 100 : i.urgency === 'soon' ? 60 : 20,
  )
  return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
}

// ─── Helpers ────────────────────────────────────────────────────────────────

const TYPE_COLORS: Record<string, string> = {
  weight: '#35A7FF',
  vaccination: '#35D483',
  deworming: '#FFE03D',
  flea_tick: '#FF7EB3',
  vet_visit: '#FF6B35',
  medication: '#35A7FF',
  symptom: '#FF7EB3',
  note: '#8A8570',
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

const speciesEmoji: Record<string, string> = {
  dog: '\uD83D\uDC36',
  cat: '\uD83D\uDC31',
  rabbit: '\uD83D\uDC30',
  other: '\uD83D\uDC3E',
}

// ─── Main Dashboard ─────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { activePet, pets, isLoaded, getLogsFor, setActivePet } = usePets()

  const logs = useMemo(
    () => (activePet ? getLogsFor(activePet.id) : []),
    [activePet, getLogsFor],
  )

  const healthItems = useMemo(
    () => (activePet ? buildHealthItems(activePet, logs) : []),
    [activePet, logs],
  )

  const score = useMemo(() => getHealthScore(healthItems), [healthItems])
  const scoreColor =
    score >= 80 ? colors.green : score >= 50 ? colors.yellow : colors.accent

  const recentLogs = useMemo(
    () =>
      [...logs]
        .sort(
          (a, b) =>
            new Date(b.date).getTime() - new Date(a.date).getTime(),
        )
        .slice(0, 8),
    [logs],
  )

  const latestWeight = useMemo(() => {
    return [...logs]
      .filter((l) => l.type === 'weight' && l.data?.weight)
      .sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      )[0]
  }, [logs])

  const handlePetSwitch = () => {
    if (pets.length <= 1) return
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: [...pets.map((p) => p.name), 'Cancel'],
          cancelButtonIndex: pets.length,
        },
        (index) => {
          if (index < pets.length) {
            hapticTap()
            setActivePet(pets[index])
          }
        },
      )
    }
  }

  if (!isLoaded) {
    return (
      <View className="flex-1 items-center justify-center bg-bg">
        <ActivityIndicator size="large" color={colors.fg} />
      </View>
    )
  }

  if (!activePet) return null

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Dashboard',
          headerLargeTitle: true,
          headerLargeTitleStyle: { color: colors.fg },
          headerStyle: { backgroundColor: colors.bg },
          headerRight: () =>
            pets.length > 1 ? (
              <Pressable onPress={handlePetSwitch} hitSlop={8}>
                <Ionicons name="swap-horizontal" size={22} color={colors.fg} />
              </Pressable>
            ) : null,
        }}
      />

      <ScrollView
        className="flex-1 bg-bg"
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 120, gap: 24 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Walking Dog */}
        {activePet.species === 'dog' && (
          <WalkingDog
            breed={activePet.breed}
            size={activePet.size}
            color={activePet.color}
          />
        )}

        {/* ── Pet Hero + Health Score ──────────────── */}
        <View
          className="bg-surface border-[2.5px] border-fg overflow-hidden"
          style={shadowMd}
        >
          <View
            className="p-5 flex-row items-center gap-4"
            style={{ backgroundColor: scoreColor + '08' }}
          >
            <View
              className="w-14 h-14 rounded items-center justify-center bg-accent/10 border-[2px] border-fg"
            >
              <Text className="text-[28px]">
                {speciesEmoji[activePet.species]}
              </Text>
            </View>

            <View className="flex-1">
              <Text className="font-mono text-[16px] uppercase tracking-[1px] text-fg leading-tight">
                {activePet.name}
              </Text>
              <Text className="text-[13px] text-muted mt-1">
                {activePet.breed} {'\u00B7'} {calcAge(activePet.birthday)}
                {latestWeight
                  ? ` \u00B7 ${latestWeight.data!.weight}${latestWeight.data!.weightUnit ?? 'kg'}`
                  : ''}
              </Text>
            </View>

            <View className="items-center">
              <Text
                className="font-mono text-[36px] leading-none"
                style={{ color: scoreColor }}
              >
                {score}
              </Text>
              <Text className="font-mono text-[9px] uppercase tracking-[1.5px] text-muted mt-1">
                Health
              </Text>
            </View>
          </View>

          {/* Score bar */}
          <View className="h-2 bg-fg/[0.06]">
            <View
              className="h-full"
              style={{ width: `${score}%`, backgroundColor: scoreColor }}
            />
          </View>
        </View>

        {/* ── Health Tracking ─────────────────────── */}
        {healthItems.length > 0 && (
          <View className="gap-3">
            <View className="bg-fg px-4 py-2.5">
              <Text className="font-mono text-[11px] uppercase tracking-[2px] text-bg">
                Health Tracking
              </Text>
            </View>

            {healthItems.map((item) => {
              const color = urgencyColor[item.urgency]
              const progress = item.lastDate
                ? Math.min(
                    1,
                    (item.cycleDays - item.daysUntilDue) / item.cycleDays,
                  )
                : 1

              return (
                <View
                  key={item.key}
                  className="bg-surface border-[2.5px] border-fg p-4"
                  style={shadow}
                >
                  <View className="flex-row items-center justify-between mb-3">
                    <View className="flex-row items-center gap-3">
                      <View
                        className="w-10 h-10 rounded items-center justify-center border-[2px] border-fg"
                        style={{ backgroundColor: color + '15' }}
                      >
                        <Ionicons
                          name={item.icon}
                          size={18}
                          color={color}
                        />
                      </View>
                      <View>
                        <Text className="font-mono text-[13px] uppercase tracking-[1px] text-fg">
                          {item.label}
                        </Text>
                        <Text className="text-[11px] text-muted mt-0.5">
                          {item.lastDate
                            ? `Last: ${formatDate(item.lastDate)}`
                            : 'No record yet'}
                        </Text>
                      </View>
                    </View>

                    <View
                      className="px-2.5 py-1.5 border-[2px] border-fg"
                      style={{ backgroundColor: color + '15' }}
                    >
                      <Text
                        className="font-mono text-[9px] uppercase tracking-[1.5px]"
                        style={{ color }}
                      >
                        {urgencyLabel[item.urgency]}
                      </Text>
                    </View>
                  </View>

                  {/* Progress bar */}
                  <View className="h-2 bg-fg/[0.06] overflow-hidden">
                    <View
                      className="h-full"
                      style={{
                        width: `${progress * 100}%`,
                        backgroundColor: color,
                      }}
                    />
                  </View>

                  {item.daysUntilDue > 0 && (
                    <Text className="text-[11px] text-muted mt-2">
                      {item.daysUntilDue} days until next is due
                    </Text>
                  )}
                  {item.daysUntilDue === 0 && item.lastDate && (
                    <Text
                      className="font-mono text-[11px] uppercase mt-2"
                      style={{ color: colors.accent }}
                    >
                      Due Now
                    </Text>
                  )}
                </View>
              )
            })}
          </View>
        )}

        {/* ── Recent Activity ─────────────────────── */}
        <View className="gap-3">
          <View className="bg-fg px-4 py-2.5">
            <Text className="font-mono text-[11px] uppercase tracking-[2px] text-bg">
              Recent Activity
            </Text>
          </View>

          {recentLogs.length === 0 ? (
            <View
              className="bg-surface border-[2.5px] border-fg p-6 items-center"
              style={shadow}
            >
              <Text className="text-[32px] mb-2">{'\uD83D\uDCCB'}</Text>
              <Text className="font-mono text-[14px] uppercase tracking-[1px] text-fg text-center">
                No Logs Yet
              </Text>
              <Text className="text-[13px] text-muted text-center mt-2">
                Use the Chat tab to start logging {activePet.name}'s health
                events.
              </Text>
            </View>
          ) : (
            recentLogs.map((item, index) => {
              const color = TYPE_COLORS[item.type] ?? colors.muted
              return (
                <View key={item.id} className="flex-row">
                  <View
                    className="items-center mr-3.5"
                    style={{ width: 18 }}
                  >
                    <View
                      className="w-3.5 h-3.5 rounded-sm mt-1.5 border-[2px] border-fg"
                      style={{ backgroundColor: color }}
                    />
                    {index < recentLogs.length - 1 && (
                      <View className="flex-1 w-[2px] bg-fg/[0.15] mt-1" />
                    )}
                  </View>

                  <View className="flex-1 pb-3">
                    <View
                      className="bg-surface border-[2.5px] border-fg p-3.5"
                      style={shadow}
                    >
                      <View className="flex-row items-center justify-between mb-1">
                        <Text
                          className="font-semibold text-[14px] text-fg flex-1"
                          numberOfLines={1}
                        >
                          {item.title}
                        </Text>
                        <View
                          className="px-2 py-1 ml-2 border-[1.5px] border-fg"
                          style={{ backgroundColor: color + '15' }}
                        >
                          <Text
                            className="font-mono text-[8px] uppercase tracking-[1.5px]"
                            style={{ color }}
                          >
                            {slugToLabel(item.type)}
                          </Text>
                        </View>
                      </View>

                      <Text className="text-[11px] text-muted">
                        {formatDate(item.date)}
                      </Text>

                      {item.notes && (
                        <Text
                          className="text-[12px] text-fg/60 mt-1.5"
                          numberOfLines={2}
                        >
                          {item.notes}
                        </Text>
                      )}

                      {item.data?.weight && (
                        <View className="mt-2 flex-row items-baseline gap-1">
                          <Text className="font-mono text-[18px] text-fg">
                            {item.data.weight}
                          </Text>
                          <Text className="text-[11px] text-muted">
                            {item.data.weightUnit ?? 'kg'}
                          </Text>
                        </View>
                      )}

                      {item.data?.cost != null && (
                        <Text className="text-[11px] text-muted mt-1">
                          Cost: ${item.data.cost}
                        </Text>
                      )}
                    </View>
                  </View>
                </View>
              )
            })
          )}
        </View>
      </ScrollView>
    </>
  )
}
