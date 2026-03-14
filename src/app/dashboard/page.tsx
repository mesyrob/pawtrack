'use client'

import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { usePets } from '@/contexts/PetContext'
import { daysSince } from '@/lib/utils'
import { LogEntry } from '@/lib/types'
import StatBox from '@/components/ui/StatBox'
import PetCard from '@/components/dashboard/PetCard'
import TodoList from '@/components/dashboard/TodoList'
import RecentLogs from '@/components/dashboard/RecentLogs'
import Button from '@/components/ui/Button'

function getLastVaccineDate(logs: LogEntry[]): string | null {
  const vaccines = logs.filter((l) => l.type === 'vaccination').sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  return vaccines[0]?.date ?? null
}

function getLastVetDate(logs: LogEntry[]): string | null {
  const visits = logs.filter((l) => l.type === 'vet_visit').sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
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
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)]">
        <div className="flex gap-2">
          <div className="w-3 h-3 bg-[var(--color-fg)] rounded-[2px] animate-bounce" />
          <div className="w-3 h-3 bg-[var(--color-fg)] rounded-[2px] animate-bounce [animation-delay:150ms]" />
          <div className="w-3 h-3 bg-[var(--color-fg)] rounded-[2px] animate-bounce [animation-delay:300ms]" />
        </div>
      </div>
    )
  }

  if (!activePet) return null

  const logs = getLogsFor(activePet.id)
  const lastVaccine = getLastVaccineDate(logs)
  const lastVet = getLastVetDate(logs)
  const weightChange = getWeightChange(logs)

  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex flex-col">
      {/* Header */}
      <div className="bg-[var(--color-surface)] border-b-2 border-[var(--color-border)] px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <span className="font-mono font-bold text-[14px] uppercase tracking-[2px]">🐾 PawTrack</span>
        {pets.length > 1 && (
          <div className="flex gap-1">
            {pets.map((p) => (
              <button
                key={p.id}
                onClick={() => setActivePet(p)}
                className={[
                  'px-3 py-1 font-mono font-bold text-[10px] uppercase tracking-[1px]',
                  'border-2 border-[var(--color-border)] rounded-[2px]',
                  activePet.id === p.id
                    ? 'bg-[var(--color-fg)] text-[var(--color-bg)]'
                    : 'bg-[var(--color-surface)] text-[var(--color-fg)]',
                ].join(' ')}
              >
                {p.name}
              </button>
            ))}
          </div>
        )}
        <button
          onClick={() => router.push('/onboarding')}
          className="label-mono text-[10px] text-[var(--color-muted)] underline"
        >
          + Pet
        </button>
      </div>

      {/* Main content */}
      <div className="flex-1 max-w-lg mx-auto w-full p-4 flex flex-col gap-4 pb-32">
        {/* Pet card */}
        <PetCard pet={activePet} />

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3">
          <StatBox
            label="Last Vaccine"
            value={lastVaccine ? `${daysSince(lastVaccine)}d` : '—'}
            sub={lastVaccine ? 'days ago' : 'no record'}
            color="var(--color-green)"
          />
          <StatBox
            label="Since Vet"
            value={lastVet ? `${daysSince(lastVet)}d` : '—'}
            sub={lastVet ? 'days ago' : 'no record'}
            color="var(--color-blue)"
          />
          <StatBox
            label="Weight Δ"
            value={weightChange}
            sub="all time"
            color="var(--color-pink)"
          />
        </div>

        {/* Checklist */}
        <TodoList pet={activePet} logs={logs} />

        {/* Recent logs */}
        <RecentLogs logs={logs} />
      </div>

      {/* FAB */}
      <div className="fixed bottom-6 left-0 right-0 flex justify-center px-4">
        <Button
          variant="accent"
          size="lg"
          onClick={() => router.push('/log')}
          className="shadow-[5px_5px_0_var(--color-border)] w-full max-w-lg"
        >
          + Log Something
        </Button>
      </div>
    </div>
  )
}
