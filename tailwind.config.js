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
        sans: ['Geist', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Host Grotesk', 'Geist', 'Inter', 'sans-serif'],
        mono: ['Geist Mono', 'JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      colors: {
        // ── Light "Alytics" palette ──────────────────────────────────────
        // Layered surface palette — each step a touch darker/cooler.
        bg:        '#e9eef9',  // page background (periwinkle frame margin)
        surface:   '#ffffff',  // sidebar, inputs base
        surface2:  '#f4f5f8',  // hover surface (light gray)
        card:      '#ffffff',  // cards, panels
        card2:     '#fbfcfe',  // raised cards (modals, hover)
        line:      '#ebebeb',  // borders
        line2:     '#e0e1e6',  // hover borders
        // Brand — Alytics blue
        accent:     '#126dfb',
        accentSoft: '#e6efff',
        accentGlow: 'rgba(18,109,251,0.15)',
        accentRing: 'rgba(18,109,251,0.30)',
        // Status (tuned for contrast on white)
        ok:     '#0a9d63',
        danger: '#ef4444',
        warn:   '#e0890b',
        violet: '#7c5cff',
        // Text
        ink:    '#0b0b0d',  // headings / primary
        light:  '#575757',  // body / secondary (nav inactive)
        muted:  '#8e8e96',  // tertiary / small labels / placeholders
      },
      borderRadius: {
        card: '20px',
        ctl:  '12px',
        frame: '28px',
      },
      boxShadow: {
        card:  '0 1px 2px 0 rgba(16,24,40,0.04), 0 1px 3px 0 rgba(16,24,40,0.03)',
        glow:  '0 0 0 4px rgba(18,109,251,0.12)',
        pop:   '0 16px 40px -16px rgba(16,24,40,0.18)',
        frame: '0 24px 60px -28px rgba(18,109,251,0.28)',
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
