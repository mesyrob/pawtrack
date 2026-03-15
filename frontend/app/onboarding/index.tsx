import React, { useState, useCallback } from 'react'
import { View, Text, ScrollView, KeyboardAvoidingView, Platform } from 'react-native'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import Animated, { SlideInRight, SlideOutLeft } from 'react-native-reanimated'
import { usePets } from '@/contexts/PetContext'
import { Pet, Species, Sex, PetSize, BreedDetectionResult } from '@/lib/types'
import { generateId } from '@/lib/utils'
import ProgressBar from '@/components/ui/ProgressBar'
import StepWelcome from '@/components/onboarding/StepWelcome'
import StepPhotoCapture from '@/components/onboarding/StepPhotoCapture'
import StepPetBasics from '@/components/onboarding/StepPetBasics'
import StepPetDetails from '@/components/onboarding/StepPetDetails'
import StepHealthConfig from '@/components/onboarding/StepHealthConfig'
import StepConfirmation from '@/components/onboarding/StepConfirmation'

const TOTAL_STEPS = 6

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
  photoUri: string
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
  photoUri: '',
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
    photoUrl: draft.photoUri || undefined,
    vetClinic: draft.vetClinic || undefined,
    trackingConfig: {
      vaccinations: draft.vaccinations,
      deworming: draft.deworming,
      fleaTick: draft.fleaTick,
      weight: draft.weightTracking,
      symptoms: draft.symptoms,
    },
  }

  function handleAnalysisComplete(result: BreedDetectionResult) {
    setDraft((prev) => ({
      ...prev,
      species: result.species,
      breed: result.breed,
      color: result.color,
      size: result.size,
    }))
  }

  function handleConfirm() {
    const pet: Pet = {
      ...petPreview,
      id: generateId(),
      createdAt: new Date().toISOString(),
    }
    addPet(pet)
    router.replace('/(tabs)')
  }

  const renderStep = useCallback(() => {
    switch (step) {
      case 0:
        return <StepWelcome onNext={() => setStep(1)} />
      case 1:
        return (
          <StepPhotoCapture
            photoUri={draft.photoUri}
            onPhotoTaken={(uri) => setDraft((prev) => ({ ...prev, photoUri: uri }))}
            onAnalysisComplete={handleAnalysisComplete}
            onNext={() => setStep(2)}
            onBack={() => setStep(0)}
            onSkip={() => setStep(2)}
          />
        )
      case 2:
        return (
          <StepPetBasics
            data={{ name: draft.name, species: draft.species, breed: draft.breed }}
            onChange={(d) => setDraft((prev) => ({ ...prev, ...d }))}
            onNext={() => setStep(3)}
            onBack={() => setStep(1)}
          />
        )
      case 3:
        return (
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
            onNext={() => setStep(4)}
            onBack={() => setStep(2)}
          />
        )
      case 4:
        return (
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
            onNext={() => setStep(5)}
            onBack={() => setStep(3)}
          />
        )
      case 5:
        return (
          <StepConfirmation
            pet={petPreview}
            photoUri={draft.photoUri || undefined}
            onConfirm={handleConfirm}
            onBack={() => setStep(4)}
          />
        )
      default:
        return null
    }
  }, [step, draft])

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={['top']}>
      {/* Top bar */}
      <View className="flex-row items-center justify-between px-5 py-4 border-b border-fg/10 bg-surface">
        <Text className="text-[15px] font-bold text-fg">PawTrack</Text>
        {step > 0 && <ProgressBar total={TOTAL_STEPS} current={step} />}
      </View>

      {/* Content */}
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          className="flex-1"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Animated.View
            key={step}
            entering={SlideInRight.duration(300)}
            exiting={SlideOutLeft.duration(200)}
            className="w-full px-5 pt-6 pb-4"
          >
            {renderStep()}
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
