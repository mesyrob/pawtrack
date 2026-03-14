'use client'

import React from 'react'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Button from '@/components/ui/Button'
import { Sex, PetSize } from '@/lib/types'

interface PetDetails {
  birthday: string
  sex: Sex | ''
  size: PetSize | ''
  weight: string
  weightUnit: 'kg' | 'lbs'
  color: string
}

interface StepPetDetailsProps {
  data: PetDetails
  onChange: (data: PetDetails) => void
  onNext: () => void
  onBack: () => void
}

const sexOptions = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
]

const sizeOptions = [
  { value: 'small', label: 'Small (< 10kg)' },
  { value: 'medium', label: 'Medium (10–25kg)' },
  { value: 'large', label: 'Large (> 25kg)' },
]

export default function StepPetDetails({ data, onChange, onNext, onBack }: StepPetDetailsProps) {
  const isValid = data.birthday && data.sex && data.size && data.color.trim()

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-mono font-bold text-xl uppercase tracking-[2px] mb-1">Pet details</h2>
        <p className="text-[var(--color-muted)] text-sm font-[Instrument_Sans]">A few more details to personalise tracking.</p>
      </div>

      <Input
        label="Birthday"
        type="date"
        value={data.birthday}
        max={new Date().toISOString().split('T')[0]}
        onChange={(e) => onChange({ ...data, birthday: e.target.value })}
      />

      <div className="grid grid-cols-2 gap-4">
        <Select
          label="Sex"
          placeholder="Select..."
          value={data.sex}
          options={sexOptions}
          onChange={(e) => onChange({ ...data, sex: e.target.value as Sex })}
        />
        <Select
          label="Size"
          placeholder="Select..."
          value={data.size}
          options={sizeOptions}
          onChange={(e) => onChange({ ...data, size: e.target.value as PetSize })}
        />
      </div>

      {/* Weight with unit toggle */}
      <div className="flex flex-col gap-1.5">
        <span className="label-mono text-[11px]">Current Weight (optional)</span>
        <div className="flex gap-2">
          <input
            type="number"
            step="0.1"
            min="0"
            placeholder="0.0"
            value={data.weight}
            onChange={(e) => onChange({ ...data, weight: e.target.value })}
            className="brut-input flex-1"
          />
          <div className="flex border-2 border-[var(--color-border)] rounded-[3px] overflow-hidden shadow-[3px_3px_0_var(--color-border)]">
            {(['kg', 'lbs'] as const).map((u) => (
              <button
                key={u}
                type="button"
                onClick={() => onChange({ ...data, weightUnit: u })}
                className={[
                  'px-4 font-mono font-bold text-[11px] uppercase tracking-wide',
                  data.weightUnit === u
                    ? 'bg-[var(--color-fg)] text-[var(--color-bg)]'
                    : 'bg-[var(--color-surface)] text-[var(--color-fg)]',
                ].join(' ')}
              >
                {u}
              </button>
            ))}
          </div>
        </div>
      </div>

      <Input
        label="Coat Color"
        placeholder="e.g. Black & white, Golden, Tabby..."
        value={data.color}
        onChange={(e) => onChange({ ...data, color: e.target.value })}
      />

      <div className="flex gap-3 mt-2">
        <Button variant="ghost" size="md" onClick={onBack}>
          ← Back
        </Button>
        <Button variant="accent" size="md" fullWidth onClick={onNext} disabled={!isValid}>
          Continue →
        </Button>
      </div>
    </div>
  )
}
