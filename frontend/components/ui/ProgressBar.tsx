import React, { useEffect } from 'react'
import { View } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated'

interface ProgressBarProps {
  total: number
  current: number
}

export default function ProgressBar({ total, current }: ProgressBarProps) {
  const progress = useSharedValue(0)

  useEffect(() => {
    progress.value = withTiming(current / total, {
      duration: 400,
      easing: Easing.out(Easing.cubic),
    })
  }, [current, total, progress])

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%` as `${number}%`,
  }))

  return (
    <View className="flex-1 h-[6px] bg-fg/10 rounded-full overflow-hidden ml-3">
      <Animated.View
        className="h-full bg-accent rounded-full"
        style={animatedStyle}
      />
    </View>
  )
}
