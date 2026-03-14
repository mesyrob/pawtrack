import React, { useMemo } from 'react'
import { View, Text, SectionList, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { usePets } from '@/contexts/PetContext'
import { LogEntry } from '@/lib/types'
import { formatDate, slugToLabel } from '@/lib/utils'
import { colors, brutShadowSm, brutShadowSubtle } from '@/lib/theme'

const TYPE_COLORS: Record<string, string> = {
  weight: '#35A7FF',
  vaccination: '#35D483',
  deworming: '#FFE03D',
  flea_tick: '#FF7EB3',
  vet_visit: '#FF6B35',
  medication: '#35A7FF',
  symptom: '#FF7EB3',
  note: '#8A8570',
}

const TYPE_ICONS: Record<string, string> = {
  weight: '&#x2696;',
  vaccination: '&#x1F489;',
  deworming: '&#x1F41B;',
  flea_tick: '&#x1F99F;',
  vet_visit: '&#x1F3E5;',
  medication: '&#x1F48A;',
  symptom: '&#x1F912;',
  note: '&#x1F4DD;',
}

interface Section {
  title: string
  data: LogEntry[]
}

function groupByMonth(logs: LogEntry[]): Section[] {
  const sorted = [...logs].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  const groups: Record<string, LogEntry[]> = {}
  for (const log of sorted) {
    const d = new Date(log.date)
    const key = d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    if (!groups[key]) groups[key] = []
    groups[key].push(log)
  }

  return Object.entries(groups).map(([title, data]) => ({ title, data }))
}

function LogItem({ item, isLast }: { item: LogEntry; isLast: boolean }) {
  const color = TYPE_COLORS[item.type] ?? colors.muted

  return (
    <View className="flex-row px-5">
      {/* Timeline line + dot */}
      <View className="items-center mr-4" style={{ width: 20 }}>
        <View
          className="w-[14px] h-[14px] rounded-full border-[2.5px] mt-1"
          style={{ borderColor: colors.fg, backgroundColor: color }}
        />
        {!isLast && (
          <View className="flex-1 w-[2px] bg-fg/15 mt-1" />
        )}
      </View>

      {/* Content */}
      <View className="flex-1 pb-5">
        <View
          className="bg-surface border-[2px] border-fg rounded-md p-4"
          style={brutShadowSubtle}
        >
          <View className="flex-row items-center justify-between mb-1">
            <Text className="font-semibold text-[15px] text-fg flex-1" numberOfLines={1}>
              {item.title}
            </Text>
            <View
              className="px-2 py-0.5 rounded-sm ml-2"
              style={{ backgroundColor: color + '30' }}
            >
              <Text className="text-[10px] font-bold uppercase tracking-wide" style={{ color }}>
                {slugToLabel(item.type)}
              </Text>
            </View>
          </View>

          <Text className="text-[12px] text-muted">
            {formatDate(item.date)}
          </Text>

          {item.notes && (
            <Text className="text-[13px] text-fg/70 mt-2" numberOfLines={2}>
              {item.notes}
            </Text>
          )}

          {item.data?.weight && (
            <View className="mt-2 flex-row items-baseline gap-1">
              <Text className="font-mono text-[18px] text-fg">{item.data.weight}</Text>
              <Text className="text-[12px] text-muted">{item.data.weightUnit ?? 'kg'}</Text>
            </View>
          )}

          {item.data?.cost && (
            <Text className="text-[12px] text-muted mt-1">
              Cost: ${item.data.cost}
            </Text>
          )}
        </View>
      </View>
    </View>
  )
}

export default function TimelinePage() {
  const { activePet, isLoaded, getLogsFor } = usePets()

  const sections = useMemo(() => {
    if (!activePet) return []
    return groupByMonth(getLogsFor(activePet.id))
  }, [activePet, getLogsFor])

  if (!isLoaded) {
    return (
      <View className="flex-1 items-center justify-center bg-bg">
        <ActivityIndicator size="large" color={colors.fg} />
      </View>
    )
  }

  if (!activePet) return null

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={['top']}>
      {/* Header */}
      <View className="px-5 pt-3 pb-4">
        <Text className="text-muted text-[13px] font-semibold">{activePet.name}'s</Text>
        <Text className="font-mono text-[28px] uppercase tracking-[1px] text-fg leading-tight">
          Timeline
        </Text>
      </View>

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index, section }) => (
          <LogItem item={item} isLast={index === section.data.length - 1} />
        )}
        renderSectionHeader={({ section }) => (
          <View className="px-5 py-2 bg-bg">
            <View className="bg-fg px-3 py-1.5 rounded-md self-start">
              <Text className="font-mono text-[11px] uppercase tracking-[2px] text-bg">
                {section.title}
              </Text>
            </View>
          </View>
        )}
        stickySectionHeadersEnabled
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center px-10 pt-20">
            <Text className="text-[48px] mb-4">&#x1F4CB;</Text>
            <Text className="font-mono text-[16px] text-fg text-center uppercase tracking-wider">
              No Logs Yet
            </Text>
            <Text className="text-[14px] text-muted text-center mt-2">
              Tap the + button to log your first health entry for {activePet.name}.
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  )
}
