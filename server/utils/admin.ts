import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { serverSupabaseUser } from '#supabase/server'
import type { H3Event } from 'h3'

let _adminClient: SupabaseClient | null = null

export const getAdminClient = (): SupabaseClient => {
  if (_adminClient) return _adminClient
  const cfg = useRuntimeConfig()
  const url = cfg.supabaseUrl as string
  const key = cfg.supabaseServiceRoleKey as string
  if (!url || !key) {
    throw createError({
      statusCode: 500,
      statusMessage:
        'SUPABASE_SERVICE_ROLE_KEY missing. Add it to .env.local to enable admin endpoints.',
    })
  }
  _adminClient = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
  return _adminClient
}

/** Throws 401/403 unless the requester's JWT is a superadmin. */
export const requireSuperadmin = async (event: H3Event) => {
  const user = await serverSupabaseUser(event)
  if (!user) throw createError({ statusCode: 401, statusMessage: 'Not authenticated' })
  const role = (user.app_metadata as Record<string, unknown> | undefined)?.role
  if (role !== 'superadmin') {
    throw createError({ statusCode: 403, statusMessage: 'Superadmin only' })
  }
  return user
}
