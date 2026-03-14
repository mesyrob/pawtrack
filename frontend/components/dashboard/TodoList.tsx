import React from 'react'
import { View, Text, Pressable } from 'react-native'
import { useRouter } from 'expo-router'
import { LogEntry, Pet } from '@/lib/types'
import { daysSince, formatDate } from '@/lib/utils'
import { brutShadowSm } from '@/lib/theme'

interface TodoItem {
  label: string
  urgency: 'ok' | 'soon' | 'overdue'
  lastDate?: string
  daysAgo?: number
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
  ok:      { bg: '#35D483', label: 'OK' },
  soon:    { bg: '#FFE03D', label: 'SOON' },
  overdue: { bg: '#FF6B35', label: 'DUE' },
}

export default function TodoList({ pet, logs }: { pet: Pet; logs: LogEntry[] }) {
  const router = useRouter()
  const todos = buildTodos(pet, logs)

  if (todos.length === 0) return null

  return (
    <View className="border-[2.5px] border-fg rounded-lg overflow-hidden" style={brutShadowSm}>
      <View className="bg-fg px-4 py-2.5">
        <Text className="font-mono text-[11px] uppercase tracking-[2px] text-bg">
          Health Checklist
        </Text>
      </View>
      {todos.map((todo, index) => {
        const cfg = urgencyConfig[todo.urgency]
        return (
          <View
            key={todo.label}
            className={`flex-row items-center justify-between px-4 py-4 bg-surface ${index > 0 ? 'border-t border-fg/15' : ''}`}
          >
            <View>
              <Text className="font-semibold text-sm text-fg">{todo.label}</Text>
              <Text className="text-[11px] text-muted">
                {todo.lastDate
                  ? `Last: ${formatDate(todo.lastDate)} (${todo.daysAgo}d ago)`
                  : 'No record yet'}
              </Text>
            </View>
            <View
              className="px-2.5 py-1 rounded-md"
              style={{ backgroundColor: cfg.bg }}
            >
              <Text className="text-[10px] font-bold text-fg">
                {cfg.label}
              </Text>
            </View>
          </View>
        )
      })}
      <View className="px-4 py-3 bg-field-bg border-t border-fg/15">
        <Pressable onPress={() => router.push('/log')}>
          <Text className="text-[13px] font-semibold text-accent">
            + Log something now
          </Text>
        </Pressable>
      </View>
    </View>
  )
}
