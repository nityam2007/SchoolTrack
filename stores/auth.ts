import { defineStore } from 'pinia'
import type { AuthUser, Profile, Role } from '~/types/database'

interface AuthState {
  user: AuthUser | null
  // When the superadmin impersonates a user, we stash the SA's identity AND
  // refresh token here so we can restore the real session on exit. The browser
  // session itself is swapped to the target's tokens — RLS applies for real.
  realUser: AuthUser | null
  realRefreshToken: string | null
  error: string
  loading: boolean
  initialized: boolean
}

const IMPERSONATE_KEY = 'st:impersonate'

// Singleton in-flight refresh — overlapping callers (route middleware AND the
// supabase.auth.onAuthStateChange listener) share one refresh. Two parallel
// getSession() calls deadlock the supabase client on subsequent page loads.
let inflightRefresh: Promise<void> | null = null

const profileToAuthUser = (p: Profile): AuthUser => ({
  id: p.id,
  email: p.email,
  name: p.full_name || p.email,
  role: p.role,
  schoolId: p.school_id,
  teacherId: p.teacher_id,
  classId: p.class_id,
})

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    realUser: null,
    realRefreshToken: null,
    error: '',
    loading: false,
    initialized: false,
  }),

  getters: {
    isAuthenticated: (state) => state.user !== null,
    role: (state): Role | undefined => state.user?.role,
    schoolId: (state) => state.user?.schoolId ?? null,
    isImpersonating: (state) => state.realUser !== null,
  },

  actions: {
    async refresh() {
      if (inflightRefresh) return inflightRefresh
      inflightRefresh = (async () => {
        try {
          const sbUser = useSupabaseUser()
          if (!sbUser.value) {
            this.user = null
            return
          }
          // Yield once so the user-set lands outside Vue's hydration pass —
          // mutating reactive state during hydration causes mismatch errors.
          if (import.meta.client) await new Promise<void>((r) => setTimeout(r, 0))

          // Read role + tenant scope from the JWT app_metadata. We avoid a DB
          // round-trip on the route guard path because supabase-js can deadlock
          // on .from() during full page hydration. The DB profile is reconciled
          // in the background as a best-effort upgrade.
          const meta = (sbUser.value.app_metadata ?? {}) as Record<string, unknown>
          const role = (meta.role as Role) ?? 'teacher'
          this.user = profileToAuthUser({
            id: sbUser.value.id,
            email: sbUser.value.email ?? '',
            full_name: (sbUser.value.user_metadata?.full_name as string) ?? sbUser.value.email ?? '',
            role,
            school_id: (meta.school_id as string) || null,
            teacher_id: (meta.teacher_id as string) || null,
            class_id: (meta.class_id as string) || null,
          })
          useSb()
            .from('profiles').select('*').eq('id', sbUser.value.id).single<Profile>()
            .then(
              ({ data }) => { if (data) this.user = profileToAuthUser(data) },
              () => { /* JWT view is already populated */ },
            )
        } catch (e) {
          this.user = null
          this.error = (e as Error).message
        } finally {
          this.initialized = true
        }
      })()
      try { await inflightRefresh } finally { inflightRefresh = null }
    },

    async login(email: string, password: string): Promise<boolean> {
      this.error = ''
      this.loading = true
      try {
        const { error } = await useSupabaseClient().auth.signInWithPassword({ email, password })
        if (error) {
          this.error = error.message
          return false
        }
        await this.refresh()
        return this.isAuthenticated
      } finally {
        this.loading = false
      }
    },

    async logout() {
      // If currently impersonating, drop the impersonation marker so we
      // sign out cleanly (no attempt to restore on next load).
      if (import.meta.client) sessionStorage.removeItem(IMPERSONATE_KEY)
      this.realUser = null
      this.realRefreshToken = null
      await useSupabaseClient().auth.signOut()
      this.user = null
      this.error = ''
    },

    // ── Impersonation (real session swap; superadmin only) ───────────────
    /**
     * Swaps the current Supabase session to the target user via a magic-link
     * token issued by /api/admin/impersonate. After this completes, the
     * browser's auth state is the target's — RLS will treat them as the
     * target for every subsequent request.
     */
    async impersonate(userId: string) {
      const supabase = useSupabaseClient()
      const real = this.realUser ?? this.user
      if (!real || real.role !== 'superadmin') {
        throw new Error('Only superadmins can impersonate')
      }
      // Capture SA's current refresh token so we can restore on exit.
      const { data: sess } = await supabase.auth.getSession()
      const realRT = sess.session?.refresh_token
      if (!realRT) throw new Error('No active session to restore from')

      const res = await $fetch<{ hashed_token: string; type: 'magiclink' }>(
        '/api/admin/impersonate',
        { method: 'POST', body: { user_id: userId } },
      )
      const { error } = await supabase.auth.verifyOtp({
        token_hash: res.hashed_token,
        type: 'magiclink',
      })
      if (error) throw error

      // Capture stash now — refresh() below will overwrite this.user.
      this.realUser = real
      this.realRefreshToken = realRT
      if (import.meta.client) {
        sessionStorage.setItem(IMPERSONATE_KEY, JSON.stringify({
          realUser: real, realRefreshToken: realRT,
        }))
      }
      await this.refresh()
    },

    /** Restores the superadmin's session. */
    async exitImpersonation() {
      if (!this.realRefreshToken) return
      const supabase = useSupabaseClient()
      const { error } = await supabase.auth.refreshSession({ refresh_token: this.realRefreshToken })
      if (error) throw error
      this.realUser = null
      this.realRefreshToken = null
      if (import.meta.client) sessionStorage.removeItem(IMPERSONATE_KEY)
      await this.refresh()
    },

    /** On page load, re-hydrate the SA stash so Exit still works. */
    hydrateImpersonation() {
      if (!import.meta.client || this.realUser) return
      const raw = sessionStorage.getItem(IMPERSONATE_KEY)
      if (!raw) return
      try {
        const { realUser, realRefreshToken } = JSON.parse(raw) as {
          realUser: AuthUser; realRefreshToken: string
        }
        this.realUser = realUser
        this.realRefreshToken = realRefreshToken
      } catch { sessionStorage.removeItem(IMPERSONATE_KEY) }
    },
  },
})
