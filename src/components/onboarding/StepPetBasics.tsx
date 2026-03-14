'use client'

import React from 'react'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Button from '@/components/ui/Button'
import Chip from '@/components/ui/Chip'
import { Species } from '@/lib/types'

interface StepPetBasicsProps {
  data: { name: string; species: Species; breed: string }
  onChange: (data: { name: string; species: Species; breed: string }) => void
  onNext: () => void
  onBack: () => void
}

const speciesOptions: { value: Species; label: string; emoji: string }[] = [
  { value: 'dog', label: 'Dog', emoji: '🐶' },
  { value: 'cat', label: 'Cat', emoji: '🐱' },
  { value: 'rabbit', label: 'Rabbit', emoji: '🐰' },
  { value: 'other', label: 'Other', emoji: '🐾' },
]

const breedOptions: Record<Species, string[]> = {
  dog: ['Mixed', 'Labrador', 'Golden Retriever', 'Bulldog', 'Poodle', 'Beagle', 'German Shepherd', 'Other'],
  cat: ['Mixed', 'Domestic Shorthair', 'Persian', 'Maine Coon', 'Siamese', 'Ragdoll', 'Bengal', 'Other'],
  rabbit: ['Mixed', 'Holland Lop', 'Mini Rex', 'Lionhead', 'Dutch', 'Flemish Giant', 'Other'],
  other: ['Other'],
}

export default function StepPetBasics({ data, onChange, onNext, onBack }: StepPetBasicsProps) {
  const isValid = data.name.trim().length > 0 && data.species && data.breed

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-mono font-bold text-xl uppercase tracking-[2px] mb-1">Meet your pet</h2>
        <p className="text-[var(--color-muted)] text-sm font-[Instrument_Sans]">Tell us a little about them.</p>
      </div>

      {/* Species chips */}
      <div className="flex flex-col gap-2">
        <span className="label-mono text-[11px]">Species</span>
        <div className="flex flex-wrap gap-2">
          {speciesOptions.map((s) => (
            <button
              key={s.value}
              type="button"
              onClick={() => onChange({ ...data, species: s.value, breed: '' })}
              className={[
                'flex items-center gap-2 px-4 py-2 border-2 border-[var(--color-border)] rounded-[3px]',
                'font-mono font-bold text-[11px] uppercase tracking-[1.5px]',
                'transition-all active:translate-x-[1px] active:translate-y-[1px]',
                data.species === s.value
                  ? 'bg-[var(--color-accent)] text-white shadow-[2px_2px_0_var(--color-border)]'
                  : 'bg-[var(--color-surface)] shadow-[3px_3px_0_var(--color-border)]',
              ].join(' ')}
            >
              <span>{s.emoji}</span>
              <span>{s.label}</span>
            </button>
          ))}
        </div>
      </div>

      <Input
        label="Pet Name"
        placeholder="Buddy, Luna, Charlie..."
        value={data.name}
        onChange={(e) => onChange({ ...data, name: e.target.value })}
      />

      {data.species && (
        <Select
          label="Breed"
          placeholder="Select breed..."
          value={data.breed}
          options={breedOptions[data.species].map((b) => ({ value: b, label: b }))}
          onChange={(e) => onChange({ ...data, breed: e.target.value })}
        />
      )}

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
