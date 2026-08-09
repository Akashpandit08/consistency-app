import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Brand palette
        bg: 'var(--bg)',
        surface: 'var(--surface)',
        border: 'var(--border)',
        accent: 'var(--accent)',
        'accent-dark': 'var(--accent-dark)',
        muted: 'var(--muted)',
        danger: '#ff4d4d',
        warning: '#f59e0b',
        success: '#22c55e',
        // Surface variants
        'surface-2': 'var(--surface-2)',
        'surface-3': 'var(--surface-3)',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'Arial', 'sans-serif'],
      },
      borderRadius: {
        '4xl': '2rem',
      },
      animation: {
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'slide-up': 'slideUp 0.3s ease-out',
        'fade-in': 'fadeIn 0.2s ease-out',
        'bounce-in': 'bounceIn 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      },
      keyframes: {
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        bounceIn: {
          '0%': { transform: 'scale(0.3)', opacity: '0' },
          '50%': { transform: 'scale(1.05)' },
          '70%': { transform: 'scale(0.9)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      screens: {
        xs: '360px',
      },
    },
  },
  plugins: [],
}

export default config
