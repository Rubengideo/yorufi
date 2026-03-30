import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    '../../packages/ui/src/**/*.{ts,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        accent: '#6C63FF',
        surface: {
          light: '#FFFFFF',
          dark:  '#0F0F0F',
        },
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'monospace'],
      },
      borderRadius: {
        DEFAULT: '16px',
      },
      animation: {
        'check-in': 'check-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      keyframes: {
        'check-in': {
          '0%':   { transform: 'scale(0.8)', opacity: '0' },
          '100%': { transform: 'scale(1)',   opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}

export default config
