import React from 'react'

interface StatBoxProps {
  label: string
  value: string | number
  sub?: string
  color?: string // background color
  className?: string
}

export default function StatBox({ label, value, sub, color = 'var(--color-yellow)', className = '' }: StatBoxProps) {
  return (
    <div
      className={[
        'brut-card-sm p-4 flex flex-col gap-1',
        className,
      ].join(' ')}
      style={{ backgroundColor: color }}
    >
      <span className="label-mono text-[9px] text-[var(--color-fg)] opacity-70">{label}</span>
      <span className="font-mono font-bold text-2xl leading-none text-[var(--color-fg)]">{value}</span>
      {sub && <span className="text-[11px] font-[Instrument_Sans] text-[var(--color-fg)] opacity-70">{sub}</span>}
    </div>
  )
}
