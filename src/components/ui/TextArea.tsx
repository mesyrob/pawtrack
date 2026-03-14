import React from 'react'

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  hint?: string
  error?: string
}

export default function TextArea({ label, hint, error, className = '', id, ...props }: TextAreaProps) {
  const fieldId = id ?? label?.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={fieldId} className="label-mono text-[var(--color-fg)]">
          {label}
        </label>
      )}
      <textarea
        id={fieldId}
        rows={4}
        className={[
          'brut-input resize-none',
          error ? 'border-red-600 shadow-[3px_3px_0_#dc2626]' : '',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        {...props}
      />
      {hint && !error && (
        <span className="text-[11px] text-[var(--color-muted)]">{hint}</span>
      )}
      {error && (
        <span className="text-[11px] text-red-600 font-mono uppercase tracking-wide">{error}</span>
      )}
    </div>
  )
}
