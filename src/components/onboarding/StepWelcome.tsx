import React from 'react'
import Button from '@/components/ui/Button'

interface StepWelcomeProps {
  onNext: () => void
}

const features = [
  { icon: '💉', label: 'Vaccine tracking', desc: 'Never miss a booster again' },
  { icon: '⚖️', label: 'Weight log', desc: 'Track trends over time' },
  { icon: '🏥', label: 'Vet visits', desc: 'Keep all records in one place' },
  { icon: '💊', label: 'Medications', desc: 'Dosage & schedule reminders' },
]

export default function StepWelcome({ onNext }: StepWelcomeProps) {
  return (
    <div className="flex flex-col gap-8">
      {/* Hero */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 border-2.5 border-[var(--color-border)] bg-[var(--color-yellow)] shadow-[4px_4px_0_var(--color-border)] rounded-[4px] mb-4 text-4xl">
          🐾
        </div>
        <h1 className="font-mono font-bold text-3xl uppercase tracking-[3px] text-[var(--color-fg)] mb-2">
          PawTrack
        </h1>
        <p className="text-[var(--color-muted)] text-base font-[Instrument_Sans]">
          The no-nonsense health tracker for your pet.
        </p>
      </div>

      {/* Feature grid */}
      <div className="grid grid-cols-2 gap-3">
        {features.map((f) => (
          <div
            key={f.label}
            className="brut-card-sm p-4 flex flex-col gap-1 bg-[var(--color-surface)]"
          >
            <span className="text-2xl">{f.icon}</span>
            <span className="label-mono text-[10px]">{f.label}</span>
            <span className="text-[12px] text-[var(--color-muted)] font-[Instrument_Sans]">{f.desc}</span>
          </div>
        ))}
      </div>

      <Button variant="accent" size="lg" fullWidth onClick={onNext}>
        Get Started →
      </Button>

      <p className="text-center text-[11px] text-[var(--color-muted)] font-mono">
        All data stored locally on your device.
        <br />
        No account needed.
      </p>
    </div>
  )
}
