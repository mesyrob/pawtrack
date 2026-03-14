import React from 'react'
import { View, Text, ScrollView, RefreshControl, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { usePets } from '@/contexts/PetContext'
import { daysSince } from '@/lib/utils'
import { LogEntry } from '@/lib/types'
import { colors } from '@/lib/theme'
import StatBox from '@/components/ui/StatBox'
import PetCard from '@/components/dashboard/PetCard'
import WalkingDog from '@/components/dashboard/WalkingDog'
import TodoList from '@/components/dashboard/TodoList'
import RecentLogs from '@/components/dashboard/RecentLogs'
import FloatingLogButton from '@/components/ui/FloatingLogButton'

function getGreeting(): string {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  if (h < 21) return 'Good evening'
  return 'Good night'
}

function getLastVaccineDate(logs: LogEntry[]): string | null {
  const vaccines = logs
    .filter((l) => l.type === 'vaccination')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  return vaccines[0]?.date ?? null
}

function getLastVetDate(logs: LogEntry[]): string | null {
  const visits = logs
    .filter((l) => l.type === 'vet_visit')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  return visits[0]?.date ?? null
}

function getWeightChange(logs: LogEntry[]): string {
  const weights = logs
    .filter((l) => l.type === 'weight' && l.data?.weight)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  if (weights.length < 2) return '--'
  const first = weights[0].data!.weight!
  const last = weights[weights.length - 1].data!.weight!
  const diff = last - first
  const sign = diff >= 0 ? '+' : ''
  return `${sign}${diff.toFixed(1)}kg`
}

export default function HomePage() {
  const { activePet, pets, isLoaded, getLogsFor, setActivePet } = usePets()
  const [refreshing, setRefreshing] = React.useState(false)

  const onRefresh = React.useCallback(() => {
    setRefreshing(true)
    setTimeout(() => setRefreshing(false), 600)
  }, [])

  if (!isLoaded) {
    return (
      <View className="flex-1 items-center justify-center bg-bg">
        <ActivityIndicator size="large" color={colors.fg} />
      </View>
    )
  }

  if (!activePet) return null

  const logs = getLogsFor(activePet.id)
  const lastVaccine = getLastVaccineDate(logs)
  const lastVet = getLastVetDate(logs)
  const weightChange = getWeightChange(logs)

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={['top']}>
      {/* Header */}
      <View className="px-5 pt-3 pb-2">
        <Text className="text-muted text-[13px] font-semibold">{getGreeting()}</Text>
        <View className="flex-row items-baseline justify-between">
          <Text className="font-mono text-[28px] uppercase tracking-[1px] text-fg leading-tight">
            {activePet.name}
          </Text>
          {pets.length > 1 && (
            <View className="flex-row gap-1 bg-fg/5 rounded-lg p-1">
              {pets.map((p) => (
                <View
                  key={p.id}
                  className={`px-3 py-1 rounded-md ${activePet.id === p.id ? 'bg-fg' : ''}`}
                  onTouchEnd={() => setActivePet(p)}
                >
                  <Text
                    className={`text-[11px] font-bold ${activePet.id === p.id ? 'text-bg' : 'text-fg/50'}`}
                  >
                    {p.name}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </View>

      {/* Content */}
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-5 pt-2 gap-4 pb-28"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.fg}
          />
        }
      >
        {activePet.species === 'dog' && (
          <WalkingDog
            breed={activePet.breed}
            size={activePet.size}
            color={activePet.color}
          />
        )}

        <PetCard pet={activePet} />

        {/* Stats */}
        <View className="flex-row gap-3">
          <StatBox
            label="Last Vaccine"
            value={lastVaccine ? `${daysSince(lastVaccine)}d` : '--'}
            sub={lastVaccine ? 'days ago' : 'no record'}
            color={colors.green}
          />
          <StatBox
            label="Since Vet"
            value={lastVet ? `${daysSince(lastVet)}d` : '--'}
            sub={lastVet ? 'days ago' : 'no record'}
            color={colors.blue}
          />
          <StatBox
            label="Weight"
            value={weightChange}
            sub="all time"
            color={colors.pink}
          />
        </View>

        <TodoList pet={activePet} logs={logs} />
        <RecentLogs logs={logs} />

        {/* Spacer for tab bar */}
        <View className="h-4" />
      </ScrollView>

      <FloatingLogButton />
    </SafeAreaView>
  )
}
