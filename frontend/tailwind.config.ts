import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        bg: '#FFFBE6',
        fg: '#1A1A1A',
        accent: '#FF6B35',
        yellow: '#FFE03D',
        blue: '#35A7FF',
        pink: '#FF7EB3',
        green: '#35D483',
        muted: '#8A8570',
        surface: '#FFFFFF',
        'field-bg': '#FFF8E0',
      },
      fontFamily: {
        mono: ['SpaceMono_700Bold'],
      },
      borderRadius: {
        DEFAULT: '6px',
        sm: '4px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        full: '9999px',
      },
    },
  },
  plugins: [],
}

export default config
