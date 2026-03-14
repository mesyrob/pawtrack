import React, { useEffect } from 'react'
import { View, Text, ScrollView, Pressable, ActivityIndicator } from 'react-native'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { usePets } from '@/contexts/PetContext'
import { daysSince } from '@/lib/utils'
import { LogEntry } from '@/lib/types'
import { colors, brutShadow } from '@/lib/theme'
import StatBox from '@/components/ui/StatBox'
import PetCard from '@/components/dashboard/PetCard'
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
      <View className="bg-surface border-b-2 border-fg px-4 py-3 flex-row items-center justify-between">
        <Text className="font-mono text-[14px] uppercase tracking-[2px] text-fg">🐾 PawTrack</Text>
        {pets.length > 1 && (
          <View className="flex-row gap-1">
            {pets.map((p) => (
              <Pressable
                key={p.id}
                onPress={() => setActivePet(p)}
                className={`px-3 py-1 border-2 border-fg rounded-[2px] ${activePet.id === p.id ? 'bg-fg' : 'bg-surface'}`}
              >
                <Text
                  className={`font-mono text-[10px] uppercase tracking-[1px] ${activePet.id === p.id ? 'text-bg' : 'text-fg'}`}
                >
                  {p.name}
                </Text>
              </Pressable>
            ))}
          </View>
        )}
        <Pressable onPress={() => router.push('/onboarding')}>
          <Text className="font-mono uppercase text-[10px] tracking-[1.5px] text-muted underline">+ Pet</Text>
        </Pressable>
      </View>

      {/* Main content */}
      <ScrollView
        className="flex-1"
        contentContainerClassName="p-4 gap-4 pb-32 max-w-lg self-center w-full"
        showsVerticalScrollIndicator={false}
      >
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
      <View className="absolute bottom-6 left-4 right-4 items-center">
        <View className="w-full max-w-lg">
          <Button variant="accent" size="lg" fullWidth onPress={() => router.push('/log')}>
            + Log Something
          </Button>
        </View>
      </View>
    </SafeAreaView>
  )
}
