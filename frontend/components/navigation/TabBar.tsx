import React from 'react'
import { View, Text, Pressable, StyleSheet, Platform } from 'react-native'
import { BlurView } from 'expo-blur'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs'
import { colors } from '@/lib/theme'
import { hapticTap, hapticSelect } from '@/lib/haptics'

const TAB_CONFIG: Record<string, { icon: keyof typeof Ionicons.glyphMap; iconFocused: keyof typeof Ionicons.glyphMap; label: string }> = {
  index: { icon: 'home-outline', iconFocused: 'home', label: 'Home' },
  timeline: { icon: 'time-outline', iconFocused: 'time', label: 'Timeline' },
  health: { icon: 'heart-outline', iconFocused: 'heart', label: 'Health' },
  profile: { icon: 'paw-outline', iconFocused: 'paw', label: 'Profile' },
}

export default function TabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const bottomPadding = Math.max(insets.bottom, 12)

  return (
    <View style={[styles.outer, { paddingBottom: bottomPadding }]}>
      <View style={styles.pill}>
        {/* Liquid Glass blur background */}
        <BlurView
          intensity={50}
          tint="systemChromeMaterial"
          style={StyleSheet.absoluteFill}
        />
        {/* Glass tint overlay */}
        <View style={[StyleSheet.absoluteFill, styles.glassOverlay]} />

        <View style={styles.tabs}>
          {state.routes.map((route, index) => {
            const isFocused = state.index === index

            // Center FAB button
            if (route.name === 'add') {
              return (
                <Pressable
                  key={route.key}
                  onPress={() => {
                    hapticTap()
                    router.push('/log')
                  }}
                  style={styles.fabWrapper}
                >
                  {({ pressed }) => (
                    <View
                      style={[
                        styles.fab,
                        pressed && styles.fabPressed,
                      ]}
                    >
                      <Ionicons name="add" size={26} color="#FFFFFF" />
                    </View>
                  )}
                </Pressable>
              )
            }

            const config = TAB_CONFIG[route.name]
            if (!config) return null

            return (
              <Pressable
                key={route.key}
                onPress={() => {
                  hapticSelect()
                  const event = navigation.emit({
                    type: 'tabPress',
                    target: route.key,
                    canPreventDefault: true,
                  })
                  if (!isFocused && !event.defaultPrevented) {
                    navigation.navigate(route.name)
                  }
                }}
                style={styles.tab}
              >
                {/* Active glass highlight */}
                {isFocused && (
                  <View style={styles.activeGlass}>
                    <BlurView
                      intensity={40}
                      tint="systemThinMaterial"
                      style={StyleSheet.absoluteFill}
                    />
                    <View style={[StyleSheet.absoluteFill, styles.activeOverlay]} />
                  </View>
                )}
                <Ionicons
                  name={isFocused ? config.iconFocused : config.icon}
                  size={21}
                  color={isFocused ? colors.fg : colors.muted}
                  style={{ zIndex: 1 }}
                />
                <Text
                  style={[
                    styles.label,
                    {
                      color: isFocused ? colors.fg : colors.muted,
                      fontWeight: isFocused ? '700' : '500',
                    },
                  ]}
                >
                  {config.label}
                </Text>
              </Pressable>
            )
          })}
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  outer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  pill: {
    width: '100%',
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.5)',
    // Liquid glass shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 12,
  },
  glassOverlay: {
    backgroundColor: Platform.OS === 'ios'
      ? 'rgba(255, 251, 230, 0.25)'
      : 'rgba(255, 251, 230, 0.88)',
  },
  tabs: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    gap: 3,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  label: {
    fontSize: 10,
    letterSpacing: 0.2,
    zIndex: 1,
  },
  activeGlass: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 16,
    overflow: 'hidden',
  },
  activeOverlay: {
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
  },
  fabWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -18,
    marginHorizontal: 4,
  },
  fab: {
    width: 50,
    height: 50,
    borderRadius: 18,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.fg,
    // Brutalist shadow for contrast against glass
    shadowColor: colors.fg,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 6,
  },
  fabPressed: {
    shadowOffset: { width: 1, height: 1 },
    transform: [{ translateX: 2 }, { translateY: 2 }],
  },
})
