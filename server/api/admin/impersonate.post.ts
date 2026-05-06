// Issues a one-shot magic-link token for the target user. The caller
// (superadmin) verifies the returned hashed_token via supabase.auth.verifyOtp
// to get a real session for the target — i.e. real impersonation, RLS applies.

import { getAdminClient, requireSuperadmin } from '~/server/utils/admin'

export default defineEventHandler(async (event) => {
  const sa = await requireSuperadmin(event)
  const body = await readBody<{ user_id?: string; email?: string }>(event)
  const admin = getAdminClient()

  // Resolve target email — accept either user_id or email.
  let email = body.email?.trim()
  if (!email && body.user_id) {
    const { data, error } = await admin.auth.admin.getUserById(body.user_id)
    if (error || !data.user?.email) {
      throw createError({ statusCode: 404, statusMessage: 'Target user not found' })
    }
    email = data.user.email
  }
  if (!email) throw createError({ statusCode: 400, statusMessage: 'user_id or email required' })
  if (email === sa.email) {
    throw createError({ statusCode: 400, statusMessage: 'Cannot impersonate yourself' })
  }

  const { data, error } = await admin.auth.admin.generateLink({ type: 'magiclink', email })
  if (error || !data.properties?.hashed_token) {
    throw createError({ statusCode: 500, statusMessage: error?.message || 'Failed to issue link' })
  }

  return {
    email,
    hashed_token: data.properties.hashed_token,
    type: 'magiclink' as const,
  }
})
