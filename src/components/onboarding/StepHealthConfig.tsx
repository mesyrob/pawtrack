'use client'

import React from 'react'
import Input from '@/components/ui/Input'
import Toggle from '@/components/ui/Toggle'
import Button from '@/components/ui/Button'

interface HealthConfig {
  vaccinations: boolean
  deworming: boolean
  fleaTick: boolean
  weight: boolean
  symptoms: boolean
  vetClinic: string
}

interface StepHealthConfigProps {
  data: HealthConfig
  onChange: (data: HealthConfig) => void
  onNext: () => void
  onBack: () => void
}

const trackingItems: { key: keyof Omit<HealthConfig, 'vetClinic'>; label: string; desc: string }[] = [
  { key: 'vaccinations', label: 'Vaccinations', desc: 'Track doses & boosters' },
  { key: 'deworming', label: 'Deworming', desc: 'Antiparasitic treatments' },
  { key: 'fleaTick', label: 'Flea & Tick', desc: 'Preventative treatments' },
  { key: 'weight', label: 'Weight', desc: 'Regular weigh-ins' },
  { key: 'symptoms', label: 'Symptoms', desc: 'Log health observations' },
]

export default function StepHealthConfig({ data, onChange, onNext, onBack }: StepHealthConfigProps) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-mono font-bold text-xl uppercase tracking-[2px] mb-1">What to track</h2>
        <p className="text-[var(--color-muted)] text-sm font-[Instrument_Sans]">
          Choose what to monitor. You can change this later.
        </p>
      </div>

      <div className="brut-card-sm p-4 flex flex-col divide-y-2 divide-[var(--color-border)]">
        {trackingItems.map((item) => (
          <div key={item.key} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
            <div>
              <p className="label-mono text-[11px]">{item.label}</p>
              <p className="text-[12px] text-[var(--color-muted)] font-[Instrument_Sans]">{item.desc}</p>
            </div>
            <Toggle
              checked={data[item.key]}
              onChange={(v) => onChange({ ...data, [item.key]: v })}
            />
          </div>
        ))}
      </div>

      <Input
        label="Vet Clinic (optional)"
        placeholder="City Animal Hospital..."
        value={data.vetClinic}
        onChange={(e) => onChange({ ...data, vetClinic: e.target.value })}
      />

      <div className="flex gap-3 mt-2">
        <Button variant="ghost" size="md" onClick={onBack}>
          ← Back
        </Button>
        <Button variant="accent" size="md" fullWidth onClick={onNext}>
          Continue →
        </Button>
      </div>
    </div>
  )
}
