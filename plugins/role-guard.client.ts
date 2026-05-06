// Client-side role guard. Route middleware does not re-fire on hydration of an
// SSR'd page, so this plugin watches (route, auth.user) and enforces ROLE_RULES
// reactively whenever either changes.

export default defineNuxtPlugin(() => {
  const auth = useAuthStore()
  const route = useRoute()
  const router = useRouter()

  watch(
    [() => route.path, () => auth.user, () => auth.initialized],
    async () => {
      if (!auth.initialized) return
      if (!auth.user) {
        if (route.path !== '/login') await router.replace('/login')
        return
      }
      const rule = matchRoleRule(route.path)
      if (rule && auth.role && !rule.allow.includes(auth.role)) {
        await router.replace('/dashboard')
      }
    },
    { immediate: true },
  )
})
