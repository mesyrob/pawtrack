import React from 'react'
import { Pressable, Text, View } from 'react-native'
import { shadow } from '@/lib/theme'
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

const variants: Record<Variant, { bg: string; text: string; border: string }> = {
  primary: { bg: 'bg-fg', text: 'text-bg', border: '' },
  accent: { bg: 'bg-accent', text: 'text-white', border: '' },
  ghost: { bg: 'bg-transparent', text: 'text-fg', border: 'border border-fg/10' },
}

const sizes: Record<Size, string> = {
  sm: 'px-4 py-2.5',
  md: 'px-6 py-3.5',
  lg: 'px-8 py-4',
}

const textSizes: Record<Size, string> = {
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
  const v = variants[variant]

  return (
    <Pressable
      onPress={() => {
        hapticTap()
        onPress?.()
      }}
      disabled={disabled}
      style={({ pressed }) => ({ opacity: pressed && !disabled ? 0.75 : 1 })}
    >
      <View
        className={`flex-row items-center justify-center gap-2 rounded-lg ${v.bg} ${v.border} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${disabled ? 'opacity-40' : ''}`}
        style={variant !== 'ghost' ? shadow : undefined}
      >
        <Text className={`font-semibold ${v.text} ${textSizes[size]}`}>
          {typeof children === 'string' ? children : ''}
        </Text>
      </View>
    </Pressable>
  )
}
