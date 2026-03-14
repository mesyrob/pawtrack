import React from 'react'

interface ChipProps {
  label: string
  active?: boolean
  color?: string // CSS color for active fill
  onClick?: () => void
  className?: string
}

export default function Chip({ label, active = false, color = 'var(--color-yellow)', onClick, className = '' }: ChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'font-mono font-bold uppercase text-[10px] tracking-[1.5px]',
        'px-3 py-1.5 border-2 border-[var(--color-border)]',
        'transition-all duration-75',
        'rounded-[3px]',
        active
          ? 'shadow-[2px_2px_0_var(--color-border)]'
          : 'shadow-[2px_2px_0_var(--color-border)] bg-[var(--color-surface)]',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={active ? { backgroundColor: color } : {}}
    >
      {label}
    </button>
  )
}
