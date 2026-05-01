// Route guard: redirect unauthenticated users to /login, and bounce authed
// users away from /login back to /dashboard. Runs on every navigation.

export default defineNuxtRouteMiddleware((to) => {
  const auth = useAuthStore()
  const publicRoutes = ['/login']

  if (!auth.isAuthenticated && !publicRoutes.includes(to.path)) {
    return navigateTo('/login')
  }
  if (auth.isAuthenticated && to.path === '/login') {
    return navigateTo('/dashboard')
  }
})
