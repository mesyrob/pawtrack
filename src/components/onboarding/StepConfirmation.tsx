'use client'

import React from 'react'
import Button from '@/components/ui/Button'
import { Pet } from '@/lib/types'
import { calcAge } from '@/lib/utils'

interface StepConfirmationProps {
  pet: Omit<Pet, 'id' | 'createdAt'>
  onConfirm: () => void
  onBack: () => void
}

export default function StepConfirmation({ pet, onConfirm, onBack }: StepConfirmationProps) {
  const trackingOn = Object.entries(pet.trackingConfig)
    .filter(([, v]) => v)
    .map(([k]) => k.replace(/([A-Z])/g, ' $1').trim())

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-mono font-bold text-xl uppercase tracking-[2px] mb-1">Looks good?</h2>
        <p className="text-[var(--color-muted)] text-sm font-[Instrument_Sans]">
          Review your pet&apos;s profile before saving.
        </p>
      </div>

      {/* Pet card */}
      <div className="brut-card p-5 flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 border-2 border-[var(--color-border)] bg-[var(--color-yellow)] rounded-[4px] flex items-center justify-center text-3xl shadow-[3px_3px_0_var(--color-border)]">
            {pet.species === 'dog' ? '🐶' : pet.species === 'cat' ? '🐱' : pet.species === 'rabbit' ? '🐰' : '🐾'}
          </div>
          <div>
            <h3 className="font-mono font-bold text-2xl uppercase tracking-[2px]">{pet.name}</h3>
            <p className="text-[var(--color-muted)] text-sm">
              {pet.breed} · {calcAge(pet.birthday)} old
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 border-t-2 border-[var(--color-border)] pt-4">
          {[
            ['Sex', pet.sex],
            ['Size', pet.size],
            ['Color', pet.color],
            ['Vet', pet.vetClinic || '—'],
          ].map(([k, v]) => (
            <div key={k}>
              <p className="label-mono text-[9px] text-[var(--color-muted)]">{k}</p>
              <p className="font-[Instrument_Sans] text-sm capitalize">{v}</p>
            </div>
          ))}
        </div>

        {trackingOn.length > 0 && (
          <div className="border-t-2 border-[var(--color-border)] pt-3">
            <p className="label-mono text-[9px] text-[var(--color-muted)] mb-2">Tracking</p>
            <div className="flex flex-wrap gap-2">
              {trackingOn.map((t) => (
                <span
                  key={t}
                  className="label-mono text-[9px] px-2 py-1 bg-[var(--color-green)] border border-[var(--color-border)] rounded-[2px]"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-3 mt-2">
        <Button variant="ghost" size="md" onClick={onBack}>
          ← Edit
        </Button>
        <Button variant="accent" size="md" fullWidth onClick={onConfirm}>
          Save Pet 🐾
        </Button>
      </div>
    </div>
  )
}
