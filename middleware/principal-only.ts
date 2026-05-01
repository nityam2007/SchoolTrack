// Restricts a route to principals (and super admins).
export default defineNuxtRouteMiddleware(() => {
  const auth = useAuthStore()
  if (!auth.user) return navigateTo('/login')
  if (auth.role !== 'schooladmin' && auth.role !== 'superadmin') {
    return navigateTo('/dashboard')
  }
})
