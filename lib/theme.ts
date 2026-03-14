import { ViewStyle } from 'react-native'

export const colors = {
  bg: '#FFFBE6',
  fg: '#1A1A1A',
  accent: '#FF6B35',
  yellow: '#FFE03D',
  blue: '#35A7FF',
  pink: '#FF7EB3',
  green: '#35D483',
  muted: '#8A8570',
  surface: '#FFFFFF',
  fieldBg: '#FFF8E0',
} as const

export const brutShadow: ViewStyle = {
  shadowColor: colors.fg,
  shadowOffset: { width: 3, height: 3 },
  shadowOpacity: 1,
  shadowRadius: 0,
  elevation: 4,
}

export const brutShadowLg: ViewStyle = {
  shadowColor: colors.fg,
  shadowOffset: { width: 6, height: 6 },
  shadowOpacity: 1,
  shadowRadius: 0,
  elevation: 6,
}

export const brutShadowSm: ViewStyle = {
  shadowColor: colors.fg,
  shadowOffset: { width: 2, height: 2 },
  shadowOpacity: 1,
  shadowRadius: 0,
  elevation: 3,
}

export const brutShadowPressed: ViewStyle = {
  shadowColor: colors.fg,
  shadowOffset: { width: 1, height: 1 },
  shadowOpacity: 1,
  shadowRadius: 0,
  elevation: 1,
}

export const brutShadowAccent: ViewStyle = {
  shadowColor: colors.accent,
  shadowOffset: { width: 3, height: 3 },
  shadowOpacity: 1,
  shadowRadius: 0,
  elevation: 4,
}
