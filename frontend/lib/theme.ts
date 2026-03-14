import { ViewStyle } from 'react-native'

export const colors = {
  bg: '#F9F8F4',
  fg: '#1A1A1A',
  accent: '#FF6B35',
  yellow: '#FFE03D',
  blue: '#35A7FF',
  pink: '#FF7EB3',
  green: '#35D483',
  muted: '#8A8570',
  surface: '#FFFFFF',
  fieldBg: '#F4F3EF',
} as const

// ─── Soft iOS-style shadows ─────────────────────────────────────────────────

export const shadow: ViewStyle = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.06,
  shadowRadius: 4,
  elevation: 2,
}

export const shadowMd: ViewStyle = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 3 },
  shadowOpacity: 0.08,
  shadowRadius: 12,
  elevation: 4,
}

export const shadowLg: ViewStyle = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 6 },
  shadowOpacity: 0.1,
  shadowRadius: 20,
  elevation: 8,
}

export const shadowNone: ViewStyle = {
  shadowOpacity: 0,
  elevation: 0,
}

// Backwards-compatible aliases (used by existing code)
export const brutShadow = shadowMd
export const brutShadowLg = shadowLg
export const brutShadowSm = shadow
export const brutShadowPressed = shadowNone
export const brutShadowSubtle = shadow
export const brutShadowAccent: ViewStyle = {
  shadowColor: colors.accent,
  shadowOffset: { width: 0, height: 3 },
  shadowOpacity: 0.25,
  shadowRadius: 10,
  elevation: 4,
}
