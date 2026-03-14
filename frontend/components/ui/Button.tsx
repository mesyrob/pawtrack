import React from 'react'
import { Pressable, Text, View } from 'react-native'
import { brutShadow, brutShadowPressed } from '@/lib/theme'

type Variant = 'primary' | 'accent' | 'ghost'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps {
  variant?: Variant
  size?: Size
  fullWidth?: boolean
  disabled?: boolean
  onPress?: () => void
  children: React.ReactNode
}

const variantBg: Record<Variant, string> = {
  primary: 'bg-fg',
  accent: 'bg-accent',
  ghost: 'bg-transparent',
}

const variantText: Record<Variant, string> = {
  primary: 'text-bg',
  accent: 'text-white',
  ghost: 'text-fg',
}

const sizeStyles: Record<Size, string> = {
  sm: 'px-3 py-1.5',
  md: 'px-5 py-2.5',
  lg: 'px-7 py-3.5',
}

const sizeText: Record<Size, string> = {
  sm: 'text-[10px]',
  md: 'text-[11px]',
  lg: 'text-[12px]',
}

export default function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  onPress,
  children,
}: ButtonProps) {
  return (
    <Pressable onPress={onPress} disabled={disabled}>
      {({ pressed }) => (
        <View
          className={`flex-row items-center justify-center gap-2 border-[2.5px] border-fg rounded-[3px] ${variantBg[variant]} ${sizeStyles[size]} ${fullWidth ? 'w-full' : ''} ${disabled ? 'opacity-40' : ''}`}
          style={pressed && !disabled ? brutShadowPressed : brutShadow}
        >
          <Text
            className={`font-mono uppercase tracking-[2px] ${variantText[variant]} ${sizeText[size]}`}
          >
            {typeof children === 'string' ? children : ''}
          </Text>
        </View>
      )}
    </Pressable>
  )
}
