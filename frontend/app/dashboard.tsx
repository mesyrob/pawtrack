import React, { useEffect } from 'react'
import { View, Text, ScrollView, Pressable, ActivityIndicator } from 'react-native'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { usePets } from '@/contexts/PetContext'
import { daysSince } from '@/lib/utils'
import { LogEntry } from '@/lib/types'
import { colors } from '@/lib/theme'
import { hapticTap } from '@/lib/haptics'
import StatBox from '@/components/ui/StatBox'
import PetCard from '@/components/dashboard/PetCard'
import WalkingDog from '@/components/dashboard/WalkingDog'
import TodoList from '@/components/dashboard/TodoList'
import RecentLogs from '@/components/dashboard/RecentLogs'
import Button from '@/components/ui/Button'

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
  if (weights.length < 2) return '—'
  const first = weights[0].data!.weight!
  const last = weights[weights.length - 1].data!.weight!
  const diff = last - first
  const sign = diff >= 0 ? '+' : ''
  return `${sign}${diff.toFixed(1)}kg`
}

export default function DashboardPage() {
  const router = useRouter()
  const { activePet, pets, isLoaded, getLogsFor, setActivePet } = usePets()

  useEffect(() => {
    if (isLoaded && pets.length === 0) {
      router.replace('/onboarding')
    }
  }, [isLoaded, pets, router])

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
      <View className="bg-surface border-b border-fg/10 px-5 py-3 flex-row items-center justify-between">
        <Text className="font-mono text-[14px] uppercase tracking-[2px] text-fg">PawTrack</Text>
        {pets.length > 1 && (
          <View className="flex-row gap-1.5 bg-fg/5 rounded-lg p-1">
            {pets.map((p) => (
              <Pressable
                key={p.id}
                onPress={() => {
                  hapticTap()
                  setActivePet(p)
                }}
                className={`px-3 py-1.5 rounded-lg ${activePet.id === p.id ? 'bg-fg' : ''}`}
              >
                <Text
                  className={`text-[12px] font-semibold ${activePet.id === p.id ? 'text-bg' : 'text-fg/60'}`}
                >
                  {p.name}
                </Text>
              </Pressable>
            ))}
          </View>
        )}
        <Pressable
          onPress={() => {
            hapticTap()
            router.push('/onboarding')
          }}
        >
          <Text className="text-[13px] font-semibold text-accent">+ Pet</Text>
        </Pressable>
      </View>

      {/* Main content */}
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-5 pt-4 gap-5 pb-36"
        showsVerticalScrollIndicator={false}
      >
        {activePet.species === 'dog' && (
          <WalkingDog
            breed={activePet.breed}
            size={activePet.size}
            color={activePet.color}
          />
        )}
        <PetCard pet={activePet} />

        {/* Stats row */}
        <View className="flex-row gap-3">
          <StatBox
            label="Last Vaccine"
            value={lastVaccine ? `${daysSince(lastVaccine)}d` : '—'}
            sub={lastVaccine ? 'days ago' : 'no record'}
            color={colors.green}
          />
          <StatBox
            label="Since Vet"
            value={lastVet ? `${daysSince(lastVet)}d` : '—'}
            sub={lastVet ? 'days ago' : 'no record'}
            color={colors.blue}
          />
          <StatBox
            label="Weight Δ"
            value={weightChange}
            sub="all time"
            color={colors.pink}
          />
        </View>

        <TodoList pet={activePet} logs={logs} />
        <RecentLogs logs={logs} />
      </ScrollView>

      {/* FAB */}
      <View className="absolute bottom-6 left-5 right-5 items-center">
        <Button variant="accent" size="lg" fullWidth onPress={() => router.push('/log')}>
          + Log Something
        </Button>
      </View>
    </SafeAreaView>
  )
}
