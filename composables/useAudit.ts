// Audit logging — records data changes, logins, page views, exports, etc.
// Best-effort and non-blocking: failures are swallowed so logging never breaks
// a user action. Rows are RLS-scoped (insert only your own; read per role).
import type { AuditAction } from '~/types/database'

let cachedIp: string | null = null
let ipPromise: Promise<string> | null = null

const resolveIp = async (): Promise<string> => {
  if (cachedIp !== null) return cachedIp
  if (!ipPromise) {
    ipPromise = $fetch<{ ip: string }>('/api/ip')
      .then((r) => (cachedIp = r?.ip ?? ''))
      .catch(() => (cachedIp = ''))
  }
  return ipPromise
}

interface LogOpts {
  entity?: string
  entityId?: string | null
  schoolId?: string | null
  path?: string
  detail?: Record<string, unknown>
}

export const useAudit = () => {
  const auth = useAuthStore()

  const log = async (action: AuditAction | string, opts: LogOpts = {}) => {
    if (!import.meta.client) return
    const u = auth.user
    if (!u) return
    try {
      const ip = await resolveIp()
      const supabase = useSb()
      await supabase.from('audit_logs').insert({
        actor_id: u.id,
        actor_email: u.email,
        role: u.role,
        action,
        entity: opts.entity ?? '',
        entity_id: opts.entityId ?? null,
        school_id: opts.schoolId ?? u.schoolId ?? null,
        path: opts.path ?? (import.meta.client ? location.pathname : null),
        ip,
        detail: opts.detail ?? null,
      })
    } catch {
      // audit_logs table may not be migrated yet — never throw to the caller.
    }
  }

  return { log }
}
