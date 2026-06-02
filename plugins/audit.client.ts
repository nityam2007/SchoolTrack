// Client audit hooks: logs page views (every navigation) plus login/logout.
// Data-mutation events are logged at their call sites via useAudit().log().
export default defineNuxtPlugin(() => {
  const auth = useAuthStore()
  const route = useRoute()
  const { log } = useAudit()

  // Login / logout transitions.
  watch(
    () => auth.isAuthenticated,
    (yes, was) => {
      if (yes && was === false) log('login', { path: route.path })
      if (!yes && was === true) log('logout')
    },
  )

  // Page views — log each distinct path while authenticated.
  let last = ''
  watch(
    () => route.path,
    (path) => {
      if (!auth.isAuthenticated || path === last) return
      last = path
      log('page_view', { entity: 'page', path })
    },
    { immediate: true },
  )
})
