import { SchoolTrackPreset } from './theme/preset'

export default defineNuxtConfig({
  compatibilityDate: '2025-01-01',
  devtools: { enabled: true },

  modules: [
    '@primevue/nuxt-module',
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
    '@nuxtjs/supabase',
  ],

  css: [
    'primeicons/primeicons.css',
    '~/assets/css/main.css',
  ],

  primevue: {
    options: {
      ripple: true,
      theme: {
        preset: SchoolTrackPreset,
        options: {
          darkModeSelector: '.app-dark',
          cssLayer: {
            name: 'primevue',
            order: 'tailwind-base, primevue, tailwind-utilities',
          },
        },
      },
    },
  },

  tailwindcss: {
    cssPath: '~/assets/css/main.css',
    configPath: 'tailwind.config.js',
  },

  supabase: {
    url: process.env.SUPABASE_URL,
    key: process.env.SUPABASE_ANON_KEY,
    redirect: false,
  },

  runtimeConfig: {
    // Server-only. Used by /api/admin/* routes to perform admin actions
    // (e.g. issuing impersonation tokens). NEVER expose to the client.
    supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    supabaseUrl: process.env.SUPABASE_URL,
  },

  pinia: {
    storesDirs: ['./stores/**'],
  },

  app: {
    head: {
      title: 'SkoolTrack',
      titleTemplate: '%s · SkoolTrack',
      htmlAttrs: { lang: 'en' },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'SkoolTrack — multi-tenant K-12 SaaS for attendance, report cards, and parent messaging. skooltrack.in' },
        { name: 'application-name', content: 'SkoolTrack' },
        { name: 'robots', content: 'index, follow' },
        { property: 'og:site_name', content: 'SkoolTrack' },
        { property: 'og:title', content: 'SkoolTrack — school attendance & report cards' },
        { property: 'og:description', content: 'Attendance, report cards, and parent messaging for K-12 schools.' },
        { property: 'og:type', content: 'website' },
        { property: 'og:url', content: 'https://skooltrack.in' },
        { name: 'twitter:card', content: 'summary_large_image' },
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&family=Host+Grotesk:wght@500;600;700;800&display=swap',
        },
      ],
    },
  },

  typescript: {
    strict: true,
    typeCheck: false,
  },

  experimental: {
    appManifest: false,
  },

  nitro: {
    preset: 'vercel',
  },

  // Security headers + long-cache for immutable build assets. Camera is allowed
  // on same-origin (the teacher attendance capture needs getUserMedia).
  routeRules: {
    '/**': {
      headers: {
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'SAMEORIGIN',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Permissions-Policy': 'camera=(self), microphone=(), geolocation=()',
      },
    },
    '/_nuxt/**': { headers: { 'Cache-Control': 'public, max-age=31536000, immutable' } },
  },
})
