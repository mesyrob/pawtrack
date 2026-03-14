import React from 'react'
import { Pressable, Text, View } from 'react-native'
import { brutShadowSm, brutShadowPressed } from '@/lib/theme'
import { hapticTap } from '@/lib/haptics'

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
  sm: 'px-4 py-2',
  md: 'px-6 py-3',
  lg: 'px-8 py-4',
}

const sizeText: Record<Size, string> = {
  sm: 'text-[13px]',
  md: 'text-[15px]',
  lg: 'text-[17px]',
}

export default function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  onPress,
  children,
}: ButtonProps) {
  const isGhost = variant === 'ghost'
  const borderClass = isGhost ? 'border-[1.5px] border-fg/30' : 'border-[2px] border-fg'

  return (
    <Pressable
      onPress={() => {
        hapticTap()
        onPress?.()
      }}
      disabled={disabled}
    >
      {({ pressed }) => (
        <View
          className={`flex-row items-center justify-center gap-2 rounded-md ${borderClass} ${variantBg[variant]} ${sizeStyles[size]} ${fullWidth ? 'w-full' : ''} ${disabled ? 'opacity-40' : ''}`}
          style={!isGhost ? (pressed && !disabled ? brutShadowPressed : brutShadowSm) : undefined}
        >
          <Text
            className={`font-semibold ${variantText[variant]} ${sizeText[size]}`}
          >
            {typeof children === 'string' ? children : ''}
          </Text>
        </View>
      )}
    </Pressable>
  )
}
