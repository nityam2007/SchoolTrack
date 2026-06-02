// Sets a school's logo_url. `schools` is SA-write under RLS, so principals
// can't update it directly — this route writes via the service-role admin
// client AFTER verifying the caller owns the school.
import { getAdminClient } from '~/server/utils/admin'
import { serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  if (!user) throw createError({ statusCode: 401, statusMessage: 'Not authenticated' })

  const meta = (user.app_metadata ?? {}) as Record<string, unknown>
  const role = meta.role as string | undefined
  const ownSchool = (meta.school_id as string | undefined) ?? null

  const body = await readBody<{ school_id?: string; logo_url?: string }>(event)
  if (!body?.school_id || typeof body.logo_url !== 'string') {
    throw createError({ statusCode: 400, statusMessage: 'school_id and logo_url are required' })
  }

  const allowed = role === 'superadmin' || (role === 'schooladmin' && ownSchool === body.school_id)
  if (!allowed) throw createError({ statusCode: 403, statusMessage: 'Not allowed for this school' })

  const admin = getAdminClient()
  const { error } = await admin.from('schools').update({ logo_url: body.logo_url }).eq('id', body.school_id)
  if (error) throw createError({ statusCode: 500, statusMessage: error.message })
  return { ok: true }
})
