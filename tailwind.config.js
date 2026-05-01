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
        sans: ['Inter', 'DM Sans', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Space Grotesk', 'Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      colors: {
        // Layered surface palette — each step a few luminance points up.
        bg:        '#080B14',  // page background, deeper than card
        surface:   '#0F1424',  // sidebar, inputs
        surface2:  '#141A2D',  // hover surface
        card:      '#161D2E',  // cards, panels
        card2:     '#1B243A',  // raised cards (modals, hover)
        line:      '#1F2A44',  // borders
        line2:     '#2A3553',  // hover borders
        // Brand
        accent:     '#3B82F6',
        accentSoft: 'rgba(59,130,246,0.12)',
        accentRing: 'rgba(59,130,246,0.35)',
        // Status
        ok:     '#10B981',
        danger: '#EF4444',
        warn:   '#F59E0B',
        violet: '#8B5CF6',
        // Text
        ink:    '#F1F5F9',
        muted:  '#7B8BA7',
        light:  '#A8B5CC',
      },
      borderRadius: {
        card: '14px',
        ctl: '10px',
      },
      boxShadow: {
        card: '0 1px 0 0 rgba(255,255,255,0.04) inset, 0 8px 24px -12px rgba(0,0,0,0.5)',
        glow: '0 0 0 4px rgba(59,130,246,0.18)',
        pop:  '0 16px 48px -16px rgba(0,0,0,0.6), 0 1px 0 0 rgba(255,255,255,0.04) inset',
      },
      animation: {
        'fade-in': 'fadeIn .25s ease-out',
        'rise':    'rise .3s ease-out',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: 0 }, '100%': { opacity: 1 } },
        rise:   { '0%': { opacity: 0, transform: 'translateY(6px)' }, '100%': { opacity: 1, transform: 'translateY(0)' } },
      },
    },
  },
  plugins: [primeui],
}
