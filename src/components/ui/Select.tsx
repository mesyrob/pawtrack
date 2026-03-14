import React from 'react'

interface SelectOption {
  value: string
  label: string
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  options: SelectOption[]
  error?: string
  placeholder?: string
}

export default function Select({
  label,
  options,
  error,
  placeholder,
  className = '',
  id,
  ...props
}: SelectProps) {
  const selectId = id ?? label?.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={selectId} className="label-mono text-[var(--color-fg)]">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          id={selectId}
          className={[
            'brut-input appearance-none pr-10 cursor-pointer',
            error ? 'border-red-600 shadow-[3px_3px_0_#dc2626]' : '',
            className,
          ]
            .filter(Boolean)
            .join(' ')}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        {/* Arrow */}
        <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
          <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
            <path d="M1 1L6 7L11 1" stroke="#1A1A1A" strokeWidth="2.5" strokeLinecap="square" />
          </svg>
        </div>
      </div>
      {error && (
        <span className="text-[11px] text-red-600 font-mono uppercase tracking-wide">{error}</span>
      )}
    </div>
  )
}
