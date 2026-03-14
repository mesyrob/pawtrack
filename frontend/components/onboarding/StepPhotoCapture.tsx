import React, { useState } from 'react'
import { View, Text, Pressable, Image, ActivityIndicator } from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import { BreedDetectionResult } from '@/lib/types'
import { detectBreed, isBreedDetectionAvailable } from '@/lib/breedDetection'
import { shadowMd, shadow, colors } from '@/lib/theme'
import { hapticTap, hapticSuccess } from '@/lib/haptics'
import Button from '@/components/ui/Button'

interface StepPhotoCaptureProps {
  photoUri: string
  onPhotoTaken: (uri: string) => void
  onAnalysisComplete: (result: BreedDetectionResult) => void
  onNext: () => void
  onBack: () => void
  onSkip: () => void
}

export default function StepPhotoCapture({
  photoUri,
  onPhotoTaken,
  onAnalysisComplete,
  onNext,
  onBack,
  onSkip,
}: StepPhotoCaptureProps) {
  const [analyzing, setAnalyzing] = useState(false)
  const [result, setResult] = useState<BreedDetectionResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function pickImage(useCamera: boolean) {
    const opts: ImagePicker.ImagePickerOptions = {
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
      base64: true,
    }

    const res = useCamera
      ? await ImagePicker.launchCameraAsync(opts)
      : await ImagePicker.launchImageLibraryAsync(opts)

    if (res.canceled || !res.assets?.[0]) return

    const asset = res.assets[0]
    onPhotoTaken(asset.uri)
    setResult(null)
    setError(null)
    setAnalyzing(true)

    try {
      if (!isBreedDetectionAvailable) {
        setError('Backend API not configured — fill in details manually')
        setAnalyzing(false)
        return
      }

      const mimeType = asset.uri.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg'
      const detection = await detectBreed(asset.base64 ?? '', mimeType)
      if (detection.confidence > 0) {
        setResult(detection)
        onAnalysisComplete(detection)
        hapticSuccess()
      } else {
        setError('Could not detect breed')
      }
    } catch {
      setError('Could not detect breed')
    } finally {
      setAnalyzing(false)
    }
  }

  return (
    <View className="gap-6">
      <View>
        <Text className="text-xl font-bold text-fg mb-1">Snap a photo</Text>
        <Text className="text-muted text-sm">
          Take a photo of your pet and we'll detect their breed automatically.
        </Text>
      </View>

      {/* Photo area */}
      <View
        className="w-full aspect-square rounded-2xl bg-surface items-center justify-center overflow-hidden"
        style={shadowMd}
      >
        {photoUri ? (
          <Image source={{ uri: photoUri }} className="w-full h-full" resizeMode="cover" />
        ) : (
          <View className="items-center gap-3">
            <Text className="text-6xl">📸</Text>
            <Text className="text-[13px] text-muted">
              No photo yet
            </Text>
          </View>
        )}
      </View>

      {/* Analysis status */}
      {analyzing && (
        <View className="flex-row items-center justify-center gap-3 py-2">
          <ActivityIndicator color={colors.accent} />
          <Text className="text-[13px] font-semibold text-accent">
            Analyzing...
          </Text>
        </View>
      )}

      {result && (
        <View
          className="bg-green/20 border border-fg/[0.06] rounded-2xl p-4 flex-row items-center gap-3"
          style={shadow}
        >
          <Text className="text-2xl">✓</Text>
          <View className="flex-1">
            <Text className="text-[14px] font-bold text-fg">
              Detected: {result.breed}
            </Text>
            <Text className="text-muted text-[12px]">
              {result.color} · {result.size} · {Math.round(result.confidence * 100)}% confident
            </Text>
          </View>
        </View>
      )}

      {error && (
        <View className="bg-pink/20 border border-fg/[0.06] rounded-2xl p-4">
          <Text className="text-[14px] font-semibold text-fg">
            {error}
          </Text>
          <Text className="text-muted text-[12px]">No worries — you can fill in the details manually.</Text>
        </View>
      )}

      {/* Camera / Library buttons */}
      <View className="flex-row gap-3">
        <Pressable
          className="flex-1"
          onPress={() => {
            hapticTap()
            pickImage(true)
          }}
          style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
        >
          <View
            className="border border-fg/[0.06] rounded-2xl bg-surface py-4 items-center"
            style={shadow}
          >
            <Text className="text-2xl mb-1">📷</Text>
            <Text className="text-[13px] font-semibold text-fg">Camera</Text>
          </View>
        </Pressable>
        <Pressable
          className="flex-1"
          onPress={() => {
            hapticTap()
            pickImage(false)
          }}
          style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
        >
          <View
            className="border border-fg/[0.06] rounded-2xl bg-surface py-4 items-center"
            style={shadow}
          >
            <Text className="text-2xl mb-1">🖼️</Text>
            <Text className="text-[13px] font-semibold text-fg">Library</Text>
          </View>
        </Pressable>
      </View>

      {/* Navigation */}
      <View className="flex-row gap-3 mt-2">
        <Button variant="ghost" onPress={onBack}>← Back</Button>
        <View className="flex-1">
          <Button variant="accent" fullWidth onPress={onNext} disabled={analyzing}>
            Continue
          </Button>
        </View>
      </View>

      <Pressable onPress={onSkip} className="items-center py-1">
        <Text className="text-muted text-[13px] underline">Skip this step</Text>
      </Pressable>
    </View>
  )
}
