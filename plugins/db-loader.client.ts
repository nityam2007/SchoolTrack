// Hydrates the Pinia db store after sign-in and clears it on sign-out.
// Runs client-only because it depends on the Supabase auth listener.

export default defineNuxtPlugin(() => {
  const auth = useAuthStore()
  const db = useDbStore()
  const supabase = useSupabaseClient()

  // Initial hydration if a session is already restored.
  watch(
    () => auth.isAuthenticated,
    async (yes) => {
      if (yes && !db.loaded && !db.loading) await db.loadAll()
      if (!yes) db.reset()
    },
    { immediate: true },
  )

  // React to Supabase auth changes (token refresh, sign-out from another tab).
  supabase.auth.onAuthStateChange(async (event) => {
    if (event === 'SIGNED_OUT') {
      auth.user = null
      db.reset()
    }
    if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
      await auth.refresh()
    }
  })
})
