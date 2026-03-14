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
        bg: '#F9F8F4',
        fg: '#1A1A1A',
        accent: '#FF6B35',
        yellow: '#FFE03D',
        blue: '#35A7FF',
        pink: '#FF7EB3',
        green: '#35D483',
        muted: '#8A8570',
        surface: '#FFFFFF',
        'field-bg': '#F4F3EF',
      },
      fontFamily: {
        mono: ['SpaceMono_700Bold'],
      },
      borderRadius: {
        DEFAULT: '3px',
        sm: '2px',
        md: '3px',
        lg: '4px',
        xl: '6px',
        '2xl': '8px',
        '3xl': '12px',
        full: '9999px',
      },
    },
  },
  plugins: [],
}

export default config
