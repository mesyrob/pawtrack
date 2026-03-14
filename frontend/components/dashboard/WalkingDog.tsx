import React, { useState, useMemo } from 'react'
import { View, Text } from 'react-native'
import { WebView } from 'react-native-webview'
import { getModelConfig, parseColor } from '@/lib/dogModels'
import { generateDogSceneHtml } from '@/lib/dogSceneHtml'
import { shadowMd, colors } from '@/lib/theme'

interface WalkingDogProps {
  breed: string
  size: string
  color: string
}

export default function WalkingDog({ breed, size, color }: WalkingDogProps) {
  const [error, setError] = useState(false)

  const html = useMemo(() => {
    const config = getModelConfig(breed, size)
    const parsedColors = parseColor(color)
    return generateDogSceneHtml(config, parsedColors)
  }, [breed, size, color])

  if (error) {
    return (
      <View
        className="h-[200px] rounded-2xl bg-surface items-center justify-center"
        style={shadowMd}
      >
        <Text className="text-5xl">{'\uD83D\uDC15'}</Text>
        <Text className="text-[13px] text-muted mt-2">{breed}</Text>
      </View>
    )
  }

  return (
    <View
      className="h-[200px] rounded-2xl overflow-hidden bg-bg"
      style={shadowMd}
    >
      <WebView
        source={{ html }}
        scrollEnabled={false}
        bounces={false}
        overScrollMode="never"
        javaScriptEnabled={true}
        onError={() => setError(true)}
        style={{ backgroundColor: colors.bg }}
      />
    </View>
  )
}
