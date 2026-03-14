import React from 'react'
import { View, Text } from 'react-native'
import { LogEntry } from '@/lib/types'
import { formatDate, slugToLabel } from '@/lib/utils'
import { brutShadowSm } from '@/lib/theme'

const typeColors: Record<string, string> = {
  weight:      '#35A7FF',
  vaccination: '#35D483',
  deworming:   '#FFE03D',
  flea_tick:   '#FF7EB3',
  vet_visit:   '#FF6B35',
  medication:  '#35A7FF',
  symptom:     '#FF7EB3',
  note:        '#FFE03D',
}

export default function RecentLogs({ logs }: { logs: LogEntry[] }) {
  const sorted = [...logs]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5)

  if (sorted.length === 0) {
    return (
      <View className="border-[2.5px] border-fg rounded-lg p-5 bg-surface items-center" style={brutShadowSm}>
        <Text className="text-[14px] font-semibold text-muted">No logs yet.</Text>
        <Text className="text-[12px] text-muted mt-1">
          Start by tapping "Log Something" below.
        </Text>
      </View>
    )
  }

  return (
    <View className="border-[2.5px] border-fg rounded-lg overflow-hidden" style={brutShadowSm}>
      <View className="bg-fg px-4 py-2.5">
        <Text className="font-mono text-[11px] uppercase tracking-[2px] text-bg">
          Recent Logs
        </Text>
      </View>
      {sorted.map((log, index) => (
        <View
          key={log.id}
          className={`flex-row items-start gap-3 px-4 py-4 bg-surface ${index > 0 ? 'border-t border-fg/15' : ''}`}
        >
          <View
            className="mt-1.5 w-3 h-3 rounded-full"
            style={{ backgroundColor: typeColors[log.type] ?? '#8A8570' }}
          />
          <View className="flex-1">
            <Text className="font-semibold text-sm text-fg" numberOfLines={1}>
              {log.title}
            </Text>
            <Text className="text-[11px] text-muted">
              {slugToLabel(log.type)} · {formatDate(log.date)}
            </Text>
          </View>
        </View>
      ))}
    </View>
  )
}
