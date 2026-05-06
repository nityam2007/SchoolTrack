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
      title: 'SchoolTrack',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Multi-tenant SaaS attendance management for K-12 schools' },
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=DM+Sans:wght@400;500;600;700;800&family=Space+Grotesk:wght@500;600;700;800&display=swap',
        },
      ],
      htmlAttrs: { class: 'app-dark' },
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
})
