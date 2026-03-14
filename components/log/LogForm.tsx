import React, { useState } from 'react'
import { View, Text, Pressable, TextInput } from 'react-native'
import { useRouter } from 'expo-router'
import { usePets } from '@/contexts/PetContext'
import { LogType } from '@/lib/types'
import { generateId } from '@/lib/utils'
import { brutShadow, brutShadowSm, brutShadowPressed, colors } from '@/lib/theme'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import TextArea from '@/components/ui/TextArea'
import DateInput from '@/components/ui/DateInput'
import Button from '@/components/ui/Button'

interface LogTypeOption {
  value: LogType
  label: string
  emoji: string
  color: string
}

const logTypes: LogTypeOption[] = [
  { value: 'weight',      label: 'Weight',      emoji: '⚖️', color: '#35A7FF' },
  { value: 'vaccination', label: 'Vaccination',  emoji: '💉', color: '#35D483' },
  { value: 'deworming',   label: 'Deworming',    emoji: '🐛', color: '#FFE03D' },
  { value: 'flea_tick',   label: 'Flea & Tick',  emoji: '🦟', color: '#FF7EB3' },
  { value: 'vet_visit',   label: 'Vet Visit',    emoji: '🏥', color: '#FF6B35' },
  { value: 'medication',  label: 'Medication',   emoji: '💊', color: '#35A7FF' },
  { value: 'symptom',     label: 'Symptom',      emoji: '🤒', color: '#FF7EB3' },
  { value: 'note',        label: 'Note',         emoji: '📝', color: '#FFE03D' },
]

function pairUp<T>(arr: T[]): T[][] {
  const pairs: T[][] = []
  for (let i = 0; i < arr.length; i += 2) {
    pairs.push(arr.slice(i, i + 2))
  }
  return pairs
}

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
  const [severity, setSeverity] = useState('')
  const [vetName, setVetName] = useState('')
  const [cost, setCost] = useState('')

  const canSubmit = !!activePet && !!type && !!date && !!title.trim()

  function handleSubmit() {
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
        severity: (severity as 'mild' | 'moderate' | 'severe') || undefined,
        vetName: vetName || undefined,
        cost: cost ? parseFloat(cost) : undefined,
      },
      createdAt: new Date().toISOString(),
    })

    router.push('/dashboard')
  }

  return (
    <View className="gap-6">
      {/* Type selector */}
      <View className="gap-2">
        <Text className="font-mono uppercase text-[11px] tracking-[1.5px] text-fg">Log Type</Text>
        <View className="gap-2">
          {pairUp(logTypes).map((row, i) => (
            <View key={i} className="flex-row gap-2">
              {row.map((t) => (
                <Pressable
                  key={t.value}
                  onPress={() => {
                    setType(t.value)
                    if (!title) setTitle(t.label)
                  }}
                >
                  {({ pressed }) => (
                    <View
                      className={`flex-1 flex-row items-center gap-2 px-3 py-2.5 border-2 border-fg rounded-[3px]`}
                      style={[
                        { backgroundColor: type === t.value ? t.color : colors.surface },
                        pressed ? brutShadowPressed : brutShadowSm,
                      ]}
                    >
                      <Text className="text-lg">{t.emoji}</Text>
                      <Text className="font-mono uppercase text-[11px] tracking-[1px] text-fg">
                        {t.label}
                      </Text>
                    </View>
                  )}
                </Pressable>
              ))}
            </View>
          ))}
        </View>
      </View>

      {type !== '' && (
        <>
          <Input
            label="Title"
            placeholder="Brief description..."
            value={title}
            onChange={setTitle}
          />

          <DateInput
            label="Date"
            value={date}
            onChange={setDate}
            maximumDate={new Date()}
          />

          {/* Type-specific fields */}
          {type === 'weight' && (
            <View className="gap-1.5">
              <Text className="font-mono uppercase text-[11px] tracking-[1.5px] text-fg">Weight</Text>
              <View className="flex-row gap-2">
                <View className="flex-1">
                  <TextInput
                    keyboardType="decimal-pad"
                    placeholder="0.0"
                    value={weight}
                    onChangeText={setWeight}
                    placeholderTextColor={colors.muted}
                    className="bg-surface border-[2.5px] border-fg rounded-[3px] px-3.5 py-2.5 text-[15px] text-fg"
                    style={brutShadow}
                  />
                </View>
                <View className="flex-row border-2 border-fg rounded-[3px] overflow-hidden" style={brutShadowSm}>
                  {(['kg', 'lbs'] as const).map((u) => (
                    <Pressable
                      key={u}
                      onPress={() => setWeightUnit(u)}
                      className={`px-4 justify-center ${weightUnit === u ? 'bg-fg' : 'bg-surface'}`}
                    >
                      <Text className={`font-mono uppercase text-[11px] tracking-wider ${weightUnit === u ? 'text-bg' : 'text-fg'}`}>
                        {u}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            </View>
          )}

          {type === 'vaccination' && (
            <Input
              label="Vaccine Name"
              placeholder="Rabies, DHPP, Bordetella..."
              value={vaccineName}
              onChange={setVaccineName}
            />
          )}

          {(type === 'medication' || type === 'deworming' || type === 'flea_tick') && (
            <>
              <Input
                label="Medication / Product Name"
                placeholder="Frontline, Heartgard..."
                value={medicationName}
                onChange={setMedicationName}
              />
              <View className="flex-row gap-4">
                <View className="flex-1">
                  <Input
                    label="Dosage"
                    placeholder="e.g. 2.5ml"
                    value={dosage}
                    onChange={setDosage}
                  />
                </View>
                <View className="flex-1">
                  <Input
                    label="Duration"
                    placeholder="e.g. 7 days"
                    value={duration}
                    onChange={setDuration}
                  />
                </View>
              </View>
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
              onChange={setSeverity}
            />
          )}

          {type === 'vet_visit' && (
            <>
              <Input
                label="Vet Name"
                placeholder="Dr. Smith..."
                value={vetName}
                onChange={setVetName}
              />
              <Input
                label="Cost (optional)"
                keyboardType="decimal-pad"
                placeholder="0.00"
                value={cost}
                onChange={setCost}
              />
            </>
          )}

          <TextArea
            label="Notes (optional)"
            placeholder="Any additional observations..."
            value={notes}
            onChange={setNotes}
          />

          <View className="flex-row gap-3 pt-2">
            <Button variant="ghost" onPress={() => router.push('/dashboard')}>
              Cancel
            </Button>
            <View className="flex-1">
              <Button variant="accent" fullWidth onPress={handleSubmit} disabled={!canSubmit}>
                Save Log
              </Button>
            </View>
          </View>
        </>
      )}
    </View>
  )
}
