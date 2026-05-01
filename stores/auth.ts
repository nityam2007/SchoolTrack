import { defineStore } from 'pinia'
import type { AuthUser, Profile, Role } from '~/types/database'

interface AuthState {
  user: AuthUser | null
  error: string
  loading: boolean
  initialized: boolean
}

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
    error: '',
    loading: false,
    initialized: false,
  }),

  getters: {
    isAuthenticated: (state) => state.user !== null,
    role: (state): Role | undefined => state.user?.role,
    schoolId: (state) => state.user?.schoolId ?? null,
  },

  actions: {
    /** Pull the current Supabase session and join `profiles`. Idempotent. */
    async refresh() {
      const supabase = useSupabaseClient()
      const { data: sess } = await supabase.auth.getSession()
      const sb_user = sess.session?.user
      if (!sb_user) {
        this.user = null
        this.initialized = true
        return
      }
      const { data: profile, error } = await useSb()
        .from('profiles')
        .select('*')
        .eq('id', sb_user.id)
        .single<Profile>()
      if (error || !profile) {
        // Authenticated but no profile row — treat as logged out (rare).
        await supabase.auth.signOut()
        this.user = null
      } else {
        this.user = profileToAuthUser(profile)
      }
      this.initialized = true
    },

    async login(email: string, password: string): Promise<boolean> {
      this.error = ''
      this.loading = true
      try {
        const supabase = useSupabaseClient()
        const { error } = await supabase.auth.signInWithPassword({ email, password })
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
      const supabase = useSupabaseClient()
      await supabase.auth.signOut()
      this.user = null
      this.error = ''
    },
  },
})
