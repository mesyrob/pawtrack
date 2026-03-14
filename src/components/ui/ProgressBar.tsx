import React from 'react'

interface ProgressBarProps {
  total: number
  current: number
  className?: string
}

export default function ProgressBar({ total, current, className = '' }: ProgressBarProps) {
  return (
    <div className={['flex items-center gap-2', className].join(' ')}>
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={[
            'h-2.5 border-2 border-[var(--color-border)] rounded-[2px]',
            'transition-all duration-200',
            i < current
              ? 'bg-[var(--color-accent)] w-6'
              : i === current
              ? 'bg-[var(--color-yellow)] w-6'
              : 'bg-[var(--color-surface)] w-4',
          ].join(' ')}
        />
      ))}
      <span className="label-mono text-[10px] text-[var(--color-muted)] ml-1">
        {current}/{total}
      </span>
    </div>
  )
}
