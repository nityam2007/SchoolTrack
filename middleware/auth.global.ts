// Global route guard. Hydrates auth on first navigation, then enforces login + role.
// Client-only because @nuxtjs/supabase keeps the session in browser cookies — running
// on the server before hydration would unconditionally redirect to /login.

const PUBLIC_ROUTES = new Set(['/login'])

export default defineNuxtRouteMiddleware(async (to) => {
  if (import.meta.server) return

  const auth = useAuthStore()
  // During hydration, kick off refresh without awaiting so we don't mutate
  // reactive state mid-pass (causes "Hydration mismatch" errors). The
  // role-guard plugin re-checks once auth resolves. Post-hydration we await.
  if (!auth.initialized) {
    if (useNuxtApp().isHydrating) auth.refresh()
    else await auth.refresh()
  }

  if (auth.initialized && !auth.isAuthenticated && !PUBLIC_ROUTES.has(to.path)) {
    return navigateTo('/login')
  }
  if (auth.isAuthenticated && to.path === '/login') {
    return navigateTo('/dashboard')
  }

  if (auth.isAuthenticated && auth.role) {
    const rule = matchRoleRule(to.path)
    if (rule && !rule.allow.includes(auth.role)) return navigateTo('/dashboard')
  }
})
