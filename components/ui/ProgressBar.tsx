import React from 'react'
import { View, Text } from 'react-native'

interface ProgressBarProps {
  total: number
  current: number
}

export default function ProgressBar({ total, current }: ProgressBarProps) {
  return (
    <View className="flex-row items-center gap-2">
      {Array.from({ length: total }).map((_, i) => (
        <View
          key={i}
          className={`h-2.5 border-2 border-fg rounded-[2px] ${
            i < current
              ? 'bg-accent w-6'
              : i === current
              ? 'bg-yellow w-6'
              : 'bg-surface w-4'
          }`}
        />
      ))}
      <Text className="font-mono uppercase text-[10px] text-muted ml-1">
        {current}/{total}
      </Text>
    </View>
  )
}
