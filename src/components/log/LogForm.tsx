'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { usePets } from '@/contexts/PetContext'
import { LogType } from '@/lib/types'
import { generateId } from '@/lib/utils'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import TextArea from '@/components/ui/TextArea'
import Button from '@/components/ui/Button'

interface LogTypeOption {
  value: LogType
  label: string
  emoji: string
  color: string
}

const logTypes: LogTypeOption[] = [
  { value: 'weight',      label: 'Weight',      emoji: '⚖️', color: 'var(--color-blue)' },
  { value: 'vaccination', label: 'Vaccination',  emoji: '💉', color: 'var(--color-green)' },
  { value: 'deworming',   label: 'Deworming',    emoji: '🐛', color: 'var(--color-yellow)' },
  { value: 'flea_tick',   label: 'Flea & Tick',  emoji: '🦟', color: 'var(--color-pink)' },
  { value: 'vet_visit',   label: 'Vet Visit',    emoji: '🏥', color: 'var(--color-accent)' },
  { value: 'medication',  label: 'Medication',   emoji: '💊', color: 'var(--color-blue)' },
  { value: 'symptom',     label: 'Symptom',      emoji: '🤒', color: 'var(--color-pink)' },
  { value: 'note',        label: 'Note',         emoji: '📝', color: 'var(--color-yellow)' },
]

export default function LogForm() {
  const router = useRouter()
  const { activePet, addLog } = usePets()
  const [type, setType] = useState<LogType | ''>('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [title, setTitle] = useState('')
  const [notes, setNotes] = useState('')
  const [weight, setWeight] = useState('')
  const [weightUnit, setWeightUnit] = useState<'kg' | 'lbs'>('kg')
  const [vaccineName, setVaccineName] = useState('')
  const [medicationName, setMedicationName] = useState('')
  const [dosage, setDosage] = useState('')
  const [duration, setDuration] = useState('')
  const [severity, setSeverity] = useState<'mild' | 'moderate' | 'severe' | ''>('')
  const [vetName, setVetName] = useState('')
  const [cost, setCost] = useState('')

  const selectedType = logTypes.find((t) => t.value === type)
  const today = new Date().toISOString().split('T')[0]

  const canSubmit = !!activePet && !!type && !!date && !!title.trim()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit || !activePet) return

    addLog({
      id: generateId(),
      petId: activePet.id,
      type: type as LogType,
      date,
      title: title.trim(),
      notes: notes.trim() || undefined,
      data: {
        weight: weight ? parseFloat(weight) : undefined,
        weightUnit: weight ? weightUnit : undefined,
        vaccineName: vaccineName || undefined,
        medicationName: medicationName || undefined,
        dosage: dosage || undefined,
        duration: duration || undefined,
        severity: severity || undefined,
        vetName: vetName || undefined,
        cost: cost ? parseFloat(cost) : undefined,
      },
      createdAt: new Date().toISOString(),
    })

    router.push('/dashboard')
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {/* Type selector */}
      <div className="flex flex-col gap-2">
        <span className="label-mono text-[11px]">Log Type</span>
        <div className="grid grid-cols-2 gap-2">
          {logTypes.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => {
                setType(t.value)
                if (!title) setTitle(t.label)
              }}
              className={[
                'flex items-center gap-2 px-3 py-2.5 border-2 border-[var(--color-border)] rounded-[3px]',
                'font-mono font-bold text-[11px] uppercase tracking-[1px]',
                'transition-all active:translate-x-[1px] active:translate-y-[1px] text-left',
                type === t.value
                  ? 'shadow-[2px_2px_0_var(--color-border)]'
                  : 'bg-[var(--color-surface)] shadow-[3px_3px_0_var(--color-border)]',
              ].join(' ')}
              style={type === t.value ? { backgroundColor: t.color } : {}}
            >
              <span className="text-lg">{t.emoji}</span>
              <span>{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      {type && (
        <>
          <Input
            label="Title"
            placeholder="Brief description..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <Input
            label="Date"
            type="date"
            max={today}
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />

          {/* Type-specific fields */}
          {type === 'weight' && (
            <div className="flex flex-col gap-1.5">
              <span className="label-mono text-[11px]">Weight</span>
              <div className="flex gap-2">
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  placeholder="0.0"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="brut-input flex-1"
                />
                <div className="flex border-2 border-[var(--color-border)] rounded-[3px] overflow-hidden shadow-[3px_3px_0_var(--color-border)]">
                  {(['kg', 'lbs'] as const).map((u) => (
                    <button
                      key={u}
                      type="button"
                      onClick={() => setWeightUnit(u)}
                      className={[
                        'px-4 font-mono font-bold text-[11px] uppercase tracking-wide',
                        weightUnit === u
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
          )}

          {type === 'vaccination' && (
            <Input
              label="Vaccine Name"
              placeholder="Rabies, DHPP, Bordetella..."
              value={vaccineName}
              onChange={(e) => setVaccineName(e.target.value)}
            />
          )}

          {(type === 'medication' || type === 'deworming' || type === 'flea_tick') && (
            <>
              <Input
                label="Medication / Product Name"
                placeholder="Frontline, Heartgard..."
                value={medicationName}
                onChange={(e) => setMedicationName(e.target.value)}
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Dosage"
                  placeholder="e.g. 2.5ml"
                  value={dosage}
                  onChange={(e) => setDosage(e.target.value)}
                />
                <Input
                  label="Duration"
                  placeholder="e.g. 7 days"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                />
              </div>
            </>
          )}

          {type === 'symptom' && (
            <Select
              label="Severity"
              placeholder="Select severity..."
              value={severity}
              options={[
                { value: 'mild', label: 'Mild' },
                { value: 'moderate', label: 'Moderate' },
                { value: 'severe', label: 'Severe' },
              ]}
              onChange={(e) => setSeverity(e.target.value as 'mild' | 'moderate' | 'severe')}
            />
          )}

          {type === 'vet_visit' && (
            <>
              <Input
                label="Vet Name"
                placeholder="Dr. Smith..."
                value={vetName}
                onChange={(e) => setVetName(e.target.value)}
              />
              <Input
                label="Cost (optional)"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
              />
            </>
          )}

          <TextArea
            label="Notes (optional)"
            placeholder="Any additional observations..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => router.push('/dashboard')}>
              Cancel
            </Button>
            <Button type="submit" variant="accent" fullWidth disabled={!canSubmit}>
              Save Log
            </Button>
          </div>
        </>
      )}
    </form>
  )
}
