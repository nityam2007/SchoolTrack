import { defineStore } from 'pinia'
import type { AuthUser, Role } from '~/types/database'
import { useDbStore } from '~/stores/db'

const SUPER_ADMIN = { email: 'admin@schooltrack.in', pass: 'admin123' }

interface AuthState {
  user: AuthUser | null
  error: string
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    error: '',
  }),

  getters: {
    isAuthenticated: (state) => state.user !== null,
    role: (state) => state.user?.role,
    schoolId: (state) => state.user?.schoolId ?? null,
  },

  actions: {
    login(role: Role, email: string, pass: string): boolean {
      this.error = ''
      const db = useDbStore()

      if (role === 'superadmin') {
        if (email === SUPER_ADMIN.email && pass === SUPER_ADMIN.pass) {
          this.user = { role, email, name: 'Platform Admin', schoolId: null }
          return true
        }
        this.error = 'Invalid Super Admin credentials.'
        return false
      }

      if (role === 'schooladmin') {
        const school = db.schools.find((s) => s.adminEmail === email && s.adminPass === pass)
        if (!school) {
          this.error = 'No school account found with these credentials.'
          return false
        }
        if (!school.active) {
          this.error = 'This school account has been disabled.'
          return false
        }
        this.user = { role, email, name: 'Principal — ' + school.name, schoolId: school.id }
        return true
      }

      if (role === 'teacher') {
        const teacher = db.teachers.find((t) => t.email === email && t.pass === pass)
        if (!teacher) {
          this.error = 'No teacher account found with these credentials.'
          return false
        }
        this.user = {
          role,
          email,
          name: teacher.name,
          schoolId: teacher.schoolId,
          teacherId: teacher.id,
          classId: teacher.classId,
        }
        return true
      }

      this.error = 'Unknown role.'
      return false
    },

    logout() {
      this.user = null
      this.error = ''
    },
  },
})
