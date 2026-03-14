import React from 'react'
import { LogEntry, Pet } from '@/lib/types'
import { daysSince, formatDate } from '@/lib/utils'
import { useRouter } from 'next/navigation'

interface TodoItem {
  label: string
  urgency: 'ok' | 'soon' | 'overdue'
  lastDate?: string
  daysAgo?: number
}

interface TodoListProps {
  pet: Pet
  logs: LogEntry[]
}

function buildTodos(pet: Pet, logs: LogEntry[]): TodoItem[] {
  const items: TodoItem[] = []

  const lastLog = (type: string) =>
    logs
      .filter((l) => l.type === type)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]

  if (pet.trackingConfig.vaccinations) {
    const last = lastLog('vaccination')
    const daysAgo = last ? daysSince(last.date) : Infinity
    items.push({
      label: 'Vaccination',
      urgency: daysAgo === Infinity ? 'overdue' : daysAgo > 365 ? 'overdue' : daysAgo > 300 ? 'soon' : 'ok',
      lastDate: last?.date,
      daysAgo: last ? daysAgo : undefined,
    })
  }

  if (pet.trackingConfig.deworming) {
    const last = lastLog('deworming')
    const daysAgo = last ? daysSince(last.date) : Infinity
    items.push({
      label: 'Deworming',
      urgency: daysAgo === Infinity ? 'overdue' : daysAgo > 90 ? 'overdue' : daysAgo > 75 ? 'soon' : 'ok',
      lastDate: last?.date,
      daysAgo: last ? daysAgo : undefined,
    })
  }

  if (pet.trackingConfig.fleaTick) {
    const last = lastLog('flea_tick')
    const daysAgo = last ? daysSince(last.date) : Infinity
    items.push({
      label: 'Flea & Tick',
      urgency: daysAgo === Infinity ? 'overdue' : daysAgo > 30 ? 'overdue' : daysAgo > 25 ? 'soon' : 'ok',
      lastDate: last?.date,
      daysAgo: last ? daysAgo : undefined,
    })
  }

  if (pet.trackingConfig.weight) {
    const last = lastLog('weight')
    const daysAgo = last ? daysSince(last.date) : Infinity
    items.push({
      label: 'Weight Check',
      urgency: daysAgo === Infinity ? 'soon' : daysAgo > 30 ? 'soon' : 'ok',
      lastDate: last?.date,
      daysAgo: last ? daysAgo : undefined,
    })
  }

  return items
}

const urgencyConfig = {
  ok:      { bg: 'bg-[var(--color-green)]',  label: 'OK' },
  soon:    { bg: 'bg-[var(--color-yellow)]', label: 'SOON' },
  overdue: { bg: 'bg-[var(--color-accent)]', label: 'DUE' },
}

export default function TodoList({ pet, logs }: TodoListProps) {
  const router = useRouter()
  const todos = buildTodos(pet, logs)

  if (todos.length === 0) return null

  return (
    <div className="brut-card-sm overflow-hidden">
      <div className="bg-[var(--color-fg)] px-4 py-2.5">
        <h3 className="font-mono font-bold text-[11px] uppercase tracking-[2px] text-[var(--color-bg)]">
          Health Checklist
        </h3>
      </div>
      <div className="divide-y-2 divide-[var(--color-border)]">
        {todos.map((todo) => {
          const cfg = urgencyConfig[todo.urgency]
          return (
            <div key={todo.label} className="flex items-center justify-between px-4 py-3 bg-[var(--color-surface)]">
              <div>
                <p className="font-[Instrument_Sans] font-semibold text-sm">{todo.label}</p>
                <p className="text-[11px] text-[var(--color-muted)]">
                  {todo.lastDate
                    ? `Last: ${formatDate(todo.lastDate)} (${todo.daysAgo}d ago)`
                    : 'No record yet'}
                </p>
              </div>
              <span
                className={[
                  'label-mono text-[9px] px-2.5 py-1',
                  'border border-[var(--color-border)] rounded-[2px]',
                  cfg.bg,
                ].join(' ')}
              >
                {cfg.label}
              </span>
            </div>
          )
        })}
      </div>
      <div className="px-4 py-3 bg-[var(--color-field-bg)] border-t-2 border-[var(--color-border)]">
        <button
          onClick={() => router.push('/log')}
          className="label-mono text-[10px] text-[var(--color-accent)] underline underline-offset-2"
        >
          + Log something now
        </button>
      </div>
    </div>
  )
}
