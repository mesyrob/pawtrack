import React, { useState } from 'react'
import { View, Text, ScrollView, KeyboardAvoidingView, Platform } from 'react-native'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { usePets } from '@/contexts/PetContext'
import { Pet, Species, Sex, PetSize } from '@/lib/types'
import { generateId } from '@/lib/utils'
import ProgressBar from '@/components/ui/ProgressBar'
import StepWelcome from '@/components/onboarding/StepWelcome'
import StepPetBasics from '@/components/onboarding/StepPetBasics'
import StepPetDetails from '@/components/onboarding/StepPetDetails'
import StepHealthConfig from '@/components/onboarding/StepHealthConfig'
import StepConfirmation from '@/components/onboarding/StepConfirmation'

const TOTAL_STEPS = 5

interface PetDraft {
  name: string
  species: Species
  breed: string
  birthday: string
  sex: Sex | ''
  size: PetSize | ''
  weight: string
  weightUnit: 'kg' | 'lbs'
  color: string
  vaccinations: boolean
  deworming: boolean
  fleaTick: boolean
  weightTracking: boolean
  symptoms: boolean
  vetClinic: string
}

const initialDraft: PetDraft = {
  name: '',
  species: 'dog',
  breed: '',
  birthday: '',
  sex: '',
  size: '',
  weight: '',
  weightUnit: 'kg',
  color: '',
  vaccinations: true,
  deworming: true,
  fleaTick: true,
  weightTracking: true,
  symptoms: true,
  vetClinic: '',
}

export default function OnboardingPage() {
  const router = useRouter()
  const { addPet } = usePets()
  const [step, setStep] = useState(0)
  const [draft, setDraft] = useState<PetDraft>(initialDraft)

  const petPreview: Omit<Pet, 'id' | 'createdAt'> = {
    name: draft.name,
    species: draft.species,
    breed: draft.breed,
    birthday: draft.birthday,
    sex: (draft.sex || 'male') as Sex,
    size: (draft.size || 'medium') as PetSize,
    color: draft.color,
    vetClinic: draft.vetClinic || undefined,
    trackingConfig: {
      vaccinations: draft.vaccinations,
      deworming: draft.deworming,
      fleaTick: draft.fleaTick,
      weight: draft.weightTracking,
      symptoms: draft.symptoms,
    },
  }

  function handleConfirm() {
    const pet: Pet = {
      ...petPreview,
      id: generateId(),
      createdAt: new Date().toISOString(),
    }
    addPet(pet)
    router.push('/dashboard')
  }

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={['top']}>
      {/* Top bar */}
      <View className="flex-row items-center justify-between px-4 py-4 border-b-2 border-fg bg-surface">
        <Text className="font-mono text-[14px] uppercase tracking-[2px] text-fg">🐾 PawTrack</Text>
        {step > 0 && <ProgressBar total={TOTAL_STEPS} current={step} />}
      </View>

      {/* Content */}
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          className="flex-1"
          contentContainerClassName="items-center"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="w-full max-w-md p-6">
            {step === 0 && <StepWelcome onNext={() => setStep(1)} />}
            {step === 1 && (
              <StepPetBasics
                data={{ name: draft.name, species: draft.species, breed: draft.breed }}
                onChange={(d) => setDraft((prev) => ({ ...prev, ...d }))}
                onNext={() => setStep(2)}
                onBack={() => setStep(0)}
              />
            )}
            {step === 2 && (
              <StepPetDetails
                data={{
                  birthday: draft.birthday,
                  sex: draft.sex,
                  size: draft.size,
                  weight: draft.weight,
                  weightUnit: draft.weightUnit,
                  color: draft.color,
                }}
                onChange={(d) => setDraft((prev) => ({ ...prev, ...d }))}
                onNext={() => setStep(3)}
                onBack={() => setStep(1)}
              />
            )}
            {step === 3 && (
              <StepHealthConfig
                data={{
                  vaccinations: draft.vaccinations,
                  deworming: draft.deworming,
                  fleaTick: draft.fleaTick,
                  weight: draft.weightTracking,
                  symptoms: draft.symptoms,
                  vetClinic: draft.vetClinic,
                }}
                onChange={(d) =>
                  setDraft((prev) => ({
                    ...prev,
                    vaccinations: d.vaccinations,
                    deworming: d.deworming,
                    fleaTick: d.fleaTick,
                    weightTracking: d.weight,
                    symptoms: d.symptoms,
                    vetClinic: d.vetClinic,
                  }))
                }
                onNext={() => setStep(4)}
                onBack={() => setStep(2)}
              />
            )}
            {step === 4 && (
              <StepConfirmation
                pet={petPreview}
                onConfirm={handleConfirm}
                onBack={() => setStep(3)}
              />
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
