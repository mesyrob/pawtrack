import React from 'react'
import { View, Text } from 'react-native'
import { brutShadowSm } from '@/lib/theme'
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
    <View className="gap-6">
      <View>
        <Text className="font-mono text-xl uppercase tracking-[2px] text-fg mb-1">What to track</Text>
        <Text className="text-muted text-sm">
          Choose what to monitor. You can change this later.
        </Text>
      </View>

      <View className="border-[2.5px] border-fg rounded-[3px] p-4 bg-surface" style={brutShadowSm}>
        {trackingItems.map((item, index) => (
          <View
            key={item.key}
            className={`flex-row items-center justify-between py-3 ${index > 0 ? 'border-t-2 border-fg' : ''}`}
          >
            <View className="flex-1 mr-3">
              <Text className="font-mono uppercase text-[11px] tracking-[1.5px] text-fg">{item.label}</Text>
              <Text className="text-[12px] text-muted">{item.desc}</Text>
            </View>
            <Toggle
              checked={data[item.key]}
              onChange={(v) => onChange({ ...data, [item.key]: v })}
            />
          </View>
        ))}
      </View>

      <Input
        label="Vet Clinic (optional)"
        placeholder="City Animal Hospital..."
        value={data.vetClinic}
        onChange={(text) => onChange({ ...data, vetClinic: text })}
      />

      <View className="flex-row gap-3 mt-2">
        <Button variant="ghost" onPress={onBack}>← Back</Button>
        <View className="flex-1">
          <Button variant="accent" fullWidth onPress={onNext}>Continue →</Button>
        </View>
      </View>
    </View>
  )
}
