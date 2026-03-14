import React from 'react'
import { Pressable, View } from 'react-native'
import { shadowMd, shadow } from '@/lib/theme'

interface CardProps {
  children: React.ReactNode
  className?: string
  size?: 'sm' | 'md'
  onPress?: () => void
}

export default function Card({ children, className = '', size = 'md', onPress }: CardProps) {
  const cardShadow = size === 'md' ? shadowMd : shadow

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => ({ opacity: pressed ? 0.95 : 1 })}
      >
        <View
          className={`bg-surface rounded-xl p-5 ${className}`}
          style={cardShadow}
        >
          {children}
        </View>
      </Pressable>
    )
  }

  return (
    <View
      className={`bg-surface rounded-xl p-5 ${className}`}
      style={cardShadow}
    >
      {children}
    </View>
  )
}
