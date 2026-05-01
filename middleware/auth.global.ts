// Global route guard. Hydrates the auth store from the Supabase session on
// first navigation, then enforces login on protected routes.

export default defineNuxtRouteMiddleware(async (to) => {
  const auth = useAuthStore()
  if (!auth.initialized) await auth.refresh()

  const publicRoutes = ['/login']
  if (!auth.isAuthenticated && !publicRoutes.includes(to.path)) {
    return navigateTo('/login')
  }
  if (auth.isAuthenticated && to.path === '/login') {
    return navigateTo('/dashboard')
  }
})
