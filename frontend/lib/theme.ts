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

// ─── Brutalist offset shadows (hard edges, zero blur) ─────────────────────

export const shadow: ViewStyle = {
  shadowColor: colors.fg,
  shadowOffset: { width: 3, height: 3 },
  shadowOpacity: 1,
  shadowRadius: 0,
  elevation: 3,
}

export const shadowMd: ViewStyle = {
  shadowColor: colors.fg,
  shadowOffset: { width: 4, height: 4 },
  shadowOpacity: 1,
  shadowRadius: 0,
  elevation: 4,
}

export const shadowLg: ViewStyle = {
  shadowColor: colors.fg,
  shadowOffset: { width: 6, height: 6 },
  shadowOpacity: 1,
  shadowRadius: 0,
  elevation: 6,
}

export const shadowNone: ViewStyle = {
  shadowColor: colors.fg,
  shadowOffset: { width: 0, height: 0 },
  shadowOpacity: 0,
  shadowRadius: 0,
  elevation: 0,
}

export const shadowPressed: ViewStyle = {
  shadowColor: colors.fg,
  shadowOffset: { width: 1, height: 1 },
  shadowOpacity: 1,
  shadowRadius: 0,
  elevation: 1,
}

// Backwards-compatible aliases
export const brutShadow = shadowMd
export const brutShadowLg = shadowLg
export const brutShadowSm = shadow
export const brutShadowPressed = shadowPressed
export const brutShadowSubtle = shadow
export const brutShadowAccent: ViewStyle = {
  shadowColor: colors.accent,
  shadowOffset: { width: 3, height: 3 },
  shadowOpacity: 1,
  shadowRadius: 0,
  elevation: 3,
}
