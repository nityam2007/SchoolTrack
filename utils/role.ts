import type { Role } from '~/types/database'

// Single source of truth for route → allowed roles.
// Used by middleware/auth.global.ts (navigation) and plugins/role-guard.client.ts (hydration).
export const ROLE_RULES: Array<{ prefix: string; allow: Role[] }> = [
  { prefix: '/schools',         allow: ['superadmin'] },
  { prefix: '/credits',         allow: ['superadmin'] },
  { prefix: '/analytics',       allow: ['superadmin'] },
  { prefix: '/attendance',      allow: ['schooladmin', 'superadmin'] },
  { prefix: '/teachers',        allow: ['schooladmin', 'superadmin'] },
  { prefix: '/students',        allow: ['schooladmin', 'superadmin'] },
  { prefix: '/holidays',        allow: ['schooladmin', 'superadmin'] },
  { prefix: '/messages',        allow: ['schooladmin', 'superadmin'] },
  { prefix: '/reports',         allow: ['schooladmin', 'superadmin'] },
  { prefix: '/subjects',        allow: ['schooladmin', 'superadmin'] },
  { prefix: '/classes',         allow: ['schooladmin', 'superadmin'] },
  { prefix: '/mark-attendance', allow: ['teacher', 'superadmin'] },
  { prefix: '/my-class',        allow: ['teacher', 'superadmin'] },
  // /report-cards is shared between teachers and principals — left open.
]

export const matchRoleRule = (path: string) =>
  ROLE_RULES.find((r) => path === r.prefix || path.startsWith(`${r.prefix}/`))

// Helper for per-page middleware. Returns a redirect target if denied, else nothing.
export const requireRole = (...allowed: Role[]) => {
  if (import.meta.server) return
  const auth = useAuthStore()
  if (!auth.user) return navigateTo('/login')
  if (!allowed.includes(auth.role!)) return navigateTo('/dashboard')
}
