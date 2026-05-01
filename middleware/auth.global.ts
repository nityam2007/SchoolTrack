// Global route guard. Hydrates the auth store from the Supabase session on
// first navigation, then enforces login on protected routes.

const PUBLIC_ROUTES = new Set(['/login'])

export default defineNuxtRouteMiddleware(async (to) => {
  // Skip server-side execution — auth is a client-only concern in this app
  // (the @nuxtjs/supabase module owns session cookies). Running the guard on
  // the server before the client has hydrated produces unauth redirects on
  // prefetches and 500s on assets that resolve to a route fallback.
  if (import.meta.server) return

  const auth = useAuthStore()
  if (!auth.initialized) await auth.refresh()

  if (!auth.isAuthenticated && !PUBLIC_ROUTES.has(to.path)) {
    return navigateTo('/login')
  }
  if (auth.isAuthenticated && to.path === '/login') {
    return navigateTo('/dashboard')
  }
})
