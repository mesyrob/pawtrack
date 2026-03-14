import React from 'react'
import { LogEntry } from '@/lib/types'
import { formatDate, slugToLabel } from '@/lib/utils'

interface RecentLogsProps {
  logs: LogEntry[]
}

const typeColors: Record<string, string> = {
  weight:      'bg-[var(--color-blue)]',
  vaccination: 'bg-[var(--color-green)]',
  deworming:   'bg-[var(--color-yellow)]',
  flea_tick:   'bg-[var(--color-pink)]',
  vet_visit:   'bg-[var(--color-accent)]',
  medication:  'bg-[var(--color-blue)]',
  symptom:     'bg-[var(--color-pink)]',
  note:        'bg-[var(--color-yellow)]',
}

export default function RecentLogs({ logs }: RecentLogsProps) {
  const sorted = [...logs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5)

  if (sorted.length === 0) {
    return (
      <div className="brut-card-sm p-5 text-center">
        <p className="font-mono text-[13px] text-[var(--color-muted)]">No logs yet.</p>
        <p className="text-[12px] text-[var(--color-muted)] font-[Instrument_Sans] mt-1">
          Start by tapping &quot;LOG SOMETHING&quot; below.
        </p>
      </div>
    )
  }

  return (
    <div className="brut-card-sm overflow-hidden">
      <div className="bg-[var(--color-fg)] px-4 py-2.5">
        <h3 className="font-mono font-bold text-[11px] uppercase tracking-[2px] text-[var(--color-bg)]">
          Recent Logs
        </h3>
      </div>
      <div className="divide-y-2 divide-[var(--color-border)]">
        {sorted.map((log) => (
          <div key={log.id} className="flex items-start gap-3 px-4 py-3 bg-[var(--color-surface)]">
            <span
              className={[
                'mt-0.5 flex-shrink-0 w-2.5 h-2.5 border border-[var(--color-border)] rounded-[2px]',
                typeColors[log.type] ?? 'bg-[var(--color-muted)]',
              ].join(' ')}
            />
            <div className="flex-1 min-w-0">
              <p className="font-[Instrument_Sans] font-semibold text-sm truncate">{log.title}</p>
              <p className="text-[11px] text-[var(--color-muted)]">
                {slugToLabel(log.type)} · {formatDate(log.date)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
