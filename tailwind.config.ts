import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: 'var(--color-bg)',
        fg: 'var(--color-fg)',
        accent: 'var(--color-accent)',
        yellow: 'var(--color-yellow)',
        blue: 'var(--color-blue)',
        pink: 'var(--color-pink)',
        green: 'var(--color-green)',
        muted: 'var(--color-muted)',
        border: 'var(--color-border)',
        surface: 'var(--color-surface)',
        'field-bg': 'var(--color-field-bg)',
      },
      fontFamily: {
        mono: ['"Space Mono"', 'monospace'],
        sans: ['"Instrument Sans"', 'sans-serif'],
      },
      boxShadow: {
        brut: '3px 3px 0 var(--color-border)',
        'brut-lg': '6px 6px 0 var(--color-border)',
        'brut-accent': '3px 3px 0 var(--color-accent)',
      },
      borderRadius: {
        DEFAULT: '3px',
        sm: '2px',
        md: '3px',
        lg: '4px',
        xl: '4px',
      },
    },
  },
  plugins: [],
}

export default config
