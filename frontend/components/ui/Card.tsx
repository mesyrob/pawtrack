import React from 'react'
import { Pressable, View } from 'react-native'
import { brutShadow, brutShadowSm, brutShadowPressed } from '@/lib/theme'

interface CardProps {
  children: React.ReactNode
  className?: string
  size?: 'sm' | 'md'
  onPress?: () => void
}

export default function Card({ children, className = '', size = 'md', onPress }: CardProps) {
  const shadow = size === 'md' ? brutShadow : brutShadowSm

  if (onPress) {
    return (
      <Pressable onPress={onPress}>
        {({ pressed }) => (
          <View
            className={`bg-surface border-[2.5px] border-fg rounded-md p-5 ${className}`}
            style={pressed ? brutShadowPressed : shadow}
          >
            {children}
          </View>
        )}
      </Pressable>
    )
  }

  return (
    <View
      className={`bg-surface border-[2.5px] border-fg rounded-md p-5 ${className}`}
      style={shadow}
    >
      {children}
    </View>
  )
}
