import React from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  hint?: string
  error?: string
}

export default function Input({ label, hint, error, className = '', id, ...props }: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="label-mono text-[var(--color-fg)]">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={['brut-input', error ? 'border-red-600 shadow-[3px_3px_0_#dc2626]' : '', className]
          .filter(Boolean)
          .join(' ')}
        {...props}
      />
      {hint && !error && (
        <span className="text-[11px] text-[var(--color-muted)] font-[Instrument_Sans]">{hint}</span>
      )}
      {error && <span className="text-[11px] text-red-600 font-mono uppercase tracking-wide">{error}</span>}
    </div>
  )
}
