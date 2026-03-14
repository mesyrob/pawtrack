import React from 'react'
import { Pet } from '@/lib/types'
import { calcAge } from '@/lib/utils'

interface PetCardProps {
  pet: Pet
}

const speciesEmoji: Record<string, string> = {
  dog: '🐶',
  cat: '🐱',
  rabbit: '🐰',
  other: '🐾',
}

export default function PetCard({ pet }: PetCardProps) {
  return (
    <div className="brut-card p-5 bg-[var(--color-surface)]">
      <div className="flex items-center gap-4">
        <div className="w-20 h-20 border-2.5 border-[var(--color-border)] bg-[var(--color-yellow)] rounded-[4px] shadow-[4px_4px_0_var(--color-border)] flex items-center justify-center text-4xl flex-shrink-0">
          {speciesEmoji[pet.species] ?? '🐾'}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="font-mono font-bold text-2xl uppercase tracking-[2px] leading-none">{pet.name}</h2>
          <p className="text-[var(--color-muted)] text-sm mt-1 font-[Instrument_Sans] truncate">
            {pet.breed} · {calcAge(pet.birthday)}
          </p>
          <div className="flex flex-wrap gap-2 mt-2">
            <span className="label-mono text-[9px] px-2 py-0.5 border border-[var(--color-border)] rounded-[2px] bg-[var(--color-bg)] capitalize">
              {pet.sex}
            </span>
            <span className="label-mono text-[9px] px-2 py-0.5 border border-[var(--color-border)] rounded-[2px] bg-[var(--color-bg)] capitalize">
              {pet.size}
            </span>
          </div>
        </div>
      </div>
      {pet.vetClinic && (
        <div className="mt-4 pt-3 border-t-2 border-[var(--color-border)]">
          <p className="label-mono text-[9px] text-[var(--color-muted)]">Vet Clinic</p>
          <p className="text-sm font-[Instrument_Sans]">{pet.vetClinic}</p>
        </div>
      )}
    </div>
  )
}
