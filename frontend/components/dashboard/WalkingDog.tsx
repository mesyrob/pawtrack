import React, { useState, useMemo } from 'react'
import { View, Text } from 'react-native'
import { WebView } from 'react-native-webview'
import { getModelConfig, parseColor } from '@/lib/dogModels'
import { generateDogSceneHtml } from '@/lib/dogSceneHtml'
import { brutShadow } from '@/lib/theme'

interface WalkingDogProps {
  breed: string
  size: string
  color: string
}

export default function WalkingDog({ breed, size, color }: WalkingDogProps) {
  const [error, setError] = useState(false)

  const html = useMemo(() => {
    const config = getModelConfig(breed, size)
    const colors = parseColor(color)
    return generateDogSceneHtml(config, colors)
  }, [breed, size, color])

  if (error) {
    return (
      <View
        className="h-[200px] border-[2.5px] border-fg rounded-lg bg-surface items-center justify-center"
        style={brutShadow}
      >
        <Text className="text-5xl">🐕</Text>
        <Text className="text-[13px] text-muted mt-2">
          {breed}
        </Text>
      </View>
    )
  }

  return (
    <View
      className="h-[200px] border-[2.5px] border-fg rounded-lg overflow-hidden bg-bg"
      style={brutShadow}
    >
      <WebView
        source={{ html }}
        scrollEnabled={false}
        bounces={false}
        overScrollMode="never"
        javaScriptEnabled={true}
        onError={() => setError(true)}
        style={{ backgroundColor: '#FFFBE6' }}
      />
    </View>
  )
}
