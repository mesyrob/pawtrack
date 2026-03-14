'use client'

import React from 'react'

interface ToggleProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label?: string
  id?: string
}

export default function Toggle({ checked, onChange, label, id }: ToggleProps) {
  const toggleId = id ?? label?.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        id={toggleId}
        onClick={() => onChange(!checked)}
        className={[
          'relative w-12 h-6 border-2 border-[var(--color-border)] rounded-[4px]',
          'transition-colors duration-100',
          'shadow-[2px_2px_0_var(--color-border)]',
          checked ? 'bg-[var(--color-accent)]' : 'bg-[var(--color-surface)]',
        ].join(' ')}
      >
        <span
          className={[
            'absolute top-[2px] w-[14px] h-[14px] bg-[var(--color-fg)]',
            'border border-[var(--color-border)] rounded-full',
            'transition-transform duration-100',
            checked ? 'translate-x-[24px]' : 'translate-x-[2px]',
          ].join(' ')}
        />
      </button>
      {label && (
        <label htmlFor={toggleId} className="text-sm font-[Instrument_Sans] cursor-pointer select-none">
          {label}
        </label>
      )}
    </div>
  )
}
