import primeui from 'tailwindcss-primeui'

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['selector', '.app-dark'],
  content: [
    './components/**/*.{vue,js,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './plugins/**/*.{js,ts}',
    './app.vue',
    './error.vue',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Space Grotesk', 'DM Sans', 'sans-serif'],
      },
      colors: {
        // SchoolTrack design tokens
        bg: '#0A0E1A',
        surface: '#111827',
        card: '#161D2E',
        line: '#1E2D45',
        accent: '#3B82F6',
        accentGlow: '#3B82F640',
        ok: '#10B981',
        danger: '#EF4444',
        warn: '#F59E0B',
        violet: '#8B5CF6',
        ink: '#F1F5F9',
        muted: '#64748B',
        light: '#94A3B8',
      },
      borderRadius: {
        card: '16px',
        ctl: '10px',
      },
    },
  },
  plugins: [primeui],
}
