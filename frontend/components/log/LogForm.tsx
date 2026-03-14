import React, { useState } from 'react'
import { View, Text, Pressable, TextInput } from 'react-native'
import { useRouter } from 'expo-router'
import { usePets } from '@/contexts/PetContext'
import { LogType } from '@/lib/types'
import { generateId } from '@/lib/utils'
import { colors, shadow } from '@/lib/theme'
import { hapticTap, hapticSuccess } from '@/lib/haptics'
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
  { value: 'weight', label: 'Weight', emoji: '\u2696\uFE0F', color: '#35A7FF' },
  { value: 'vaccination', label: 'Vaccination', emoji: '\uD83D\uDC89', color: '#35D483' },
  { value: 'deworming', label: 'Deworming', emoji: '\uD83D\uDC1B', color: '#FFE03D' },
  { value: 'flea_tick', label: 'Flea & Tick', emoji: '\uD83E\uDD9F', color: '#FF7EB3' },
  { value: 'vet_visit', label: 'Vet Visit', emoji: '\uD83C\uDFE5', color: '#FF6B35' },
  { value: 'medication', label: 'Medication', emoji: '\uD83D\uDC8A', color: '#35A7FF' },
  { value: 'symptom', label: 'Symptom', emoji: '\uD83E\uDD12', color: '#FF7EB3' },
  { value: 'note', label: 'Note', emoji: '\uD83D\uDCDD', color: '#FFE03D' },
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

    hapticSuccess()
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
        severity:
          (severity as 'mild' | 'moderate' | 'severe') || undefined,
        vetName: vetName || undefined,
        cost: cost ? parseFloat(cost) : undefined,
      },
      createdAt: new Date().toISOString(),
    })

    router.back()
  }

  return (
    <View className="gap-6">
      {/* Type selector */}
      <View className="gap-2.5">
        <Text className="text-[13px] font-semibold text-muted">
          Log Type
        </Text>
        <View className="gap-2">
          {pairUp(logTypes).map((row, i) => (
            <View key={i} className="flex-row gap-2">
              {row.map((t) => {
                const active = type === t.value
                return (
                  <Pressable
                    key={t.value}
                    onPress={() => {
                      hapticTap()
                      setType(t.value)
                      if (!title) setTitle(t.label)
                    }}
                    style={({ pressed }) => ({
                      flex: 1,
                      opacity: pressed ? 0.8 : 1,
                    })}
                  >
                    <View
                      className="flex-row items-center gap-2.5 px-4 py-3.5 rounded-xl"
                      style={[
                        {
                          backgroundColor: active
                            ? t.color + '18'
                            : colors.fieldBg,
                          borderWidth: 1,
                          borderColor: active
                            ? t.color + '40'
                            : 'transparent',
                        },
                        active ? shadow : undefined,
                      ]}
                    >
                      <Text className="text-lg">{t.emoji}</Text>
                      <Text
                        className={`text-[13px] font-semibold ${active ? 'text-fg' : 'text-muted'}`}
                      >
                        {t.label}
                      </Text>
                    </View>
                  </Pressable>
                )
              })}
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

          {type === 'weight' && (
            <View className="gap-2">
              <Text className="text-[13px] font-semibold text-muted">
                Weight
              </Text>
              <View className="flex-row gap-2">
                <View className="flex-1">
                  <TextInput
                    keyboardType="decimal-pad"
                    placeholder="0.0"
                    value={weight}
                    onChangeText={setWeight}
                    placeholderTextColor={colors.muted}
                    className="bg-field-bg border border-fg/[0.06] rounded-lg px-4 py-3.5 text-[15px] text-fg"
                  />
                </View>
                <View className="flex-row bg-field-bg rounded-lg overflow-hidden">
                  {(['kg', 'lbs'] as const).map((u) => (
                    <Pressable
                      key={u}
                      onPress={() => {
                        hapticTap()
                        setWeightUnit(u)
                      }}
                      className={`px-5 justify-center rounded-lg ${weightUnit === u ? 'bg-fg' : ''}`}
                    >
                      <Text
                        className={`text-[13px] font-semibold ${weightUnit === u ? 'text-bg' : 'text-muted'}`}
                      >
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

          {(type === 'medication' ||
            type === 'deworming' ||
            type === 'flea_tick') && (
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
            <Button variant="ghost" onPress={() => router.back()}>
              Cancel
            </Button>
            <View className="flex-1">
              <Button
                variant="accent"
                fullWidth
                onPress={handleSubmit}
                disabled={!canSubmit}
              >
                Save Log
              </Button>
            </View>
          </View>
        </>
      )}
    </View>
  )
}
