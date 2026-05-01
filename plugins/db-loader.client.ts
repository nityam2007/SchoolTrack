// Hydrates the Pinia db store after sign-in and clears it on sign-out.
// Client-only because it depends on the Supabase auth listener.

export default defineNuxtPlugin(() => {
  const auth = useAuthStore()
  const db = useDbStore()
  const supabase = useSupabaseClient()

  watch(
    () => auth.isAuthenticated,
    async (yes) => {
      if (yes && !db.loaded && !db.loading) await db.loadAll()
      if (!yes) db.reset()
    },
    { immediate: true },
  )

  const { data } = supabase.auth.onAuthStateChange(async (event) => {
    if (event === 'SIGNED_OUT') {
      auth.user = null
      db.reset()
    }
    if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
      await auth.refresh()
    }
  })

  // Unsubscribe on HMR teardown to avoid duplicate listeners across reloads.
  if (import.meta.hot) import.meta.hot.dispose(() => data.subscription.unsubscribe())
})
