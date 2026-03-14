'use client'

import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { usePets } from '@/contexts/PetContext'
import LogForm from '@/components/log/LogForm'

export default function LogPage() {
  const router = useRouter()
  const { activePet, isLoaded } = usePets()

  useEffect(() => {
    if (isLoaded && !activePet) {
      router.replace('/onboarding')
    }
  }, [isLoaded, activePet, router])

  if (!isLoaded || !activePet) return null

  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex flex-col">
      {/* Header */}
      <div className="bg-[var(--color-surface)] border-b-2 border-[var(--color-border)] px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
        <button
          onClick={() => router.back()}
          className="font-mono font-bold text-[14px] w-8 h-8 flex items-center justify-center border-2 border-[var(--color-border)] rounded-[3px] bg-[var(--color-bg)] shadow-[2px_2px_0_var(--color-border)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0_var(--color-border)] transition-all"
        >
          ←
        </button>
        <div>
          <h1 className="font-mono font-bold text-[14px] uppercase tracking-[2px] leading-none">
            New Log
          </h1>
          <p className="text-[11px] text-[var(--color-muted)] font-[Instrument_Sans]">
            For {activePet.name}
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="flex-1 max-w-lg mx-auto w-full p-4">
        <LogForm />
      </div>
    </div>
  )
}
