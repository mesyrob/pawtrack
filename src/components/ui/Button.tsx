import React from 'react'

type Variant = 'primary' | 'accent' | 'ghost'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  fullWidth?: boolean
  children: React.ReactNode
}

const variantStyles: Record<Variant, string> = {
  primary: 'bg-[#1A1A1A] text-[#FFFBE6] border-[#1A1A1A] shadow-[3px_3px_0_#1A1A1A] hover:bg-[#333]',
  accent:  'bg-[#FF6B35] text-white border-[#1A1A1A] shadow-[3px_3px_0_#1A1A1A] hover:bg-[#e55a24]',
  ghost:   'bg-transparent text-[#1A1A1A] border-[#1A1A1A] shadow-[3px_3px_0_#1A1A1A] hover:bg-[#FFFBE6]',
}

const sizeStyles: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-[10px] tracking-[2px]',
  md: 'px-5 py-2.5 text-[11px] tracking-[2px]',
  lg: 'px-7 py-3.5 text-[12px] tracking-[2px]',
}

export default function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={[
        'brut-btn',
        variantStyles[variant],
        sizeStyles[size],
        fullWidth ? 'w-full' : '',
        disabled ? 'opacity-40 cursor-not-allowed pointer-events-none' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}
