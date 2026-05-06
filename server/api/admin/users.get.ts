// Lists users a superadmin may impersonate (principals + teachers).
// Returns { id, email, full_name, role, school_id, class_id }.

import { getAdminClient, requireSuperadmin } from '~/server/utils/admin'

export default defineEventHandler(async (event) => {
  await requireSuperadmin(event)
  const admin = getAdminClient()

  // Profiles is the source of truth: every signed-in user has a row keyed on
  // their auth.users.id with role + school + class scope.
  const { data, error } = await admin
    .from('profiles')
    .select('id, email, full_name, role, school_id, class_id')
    .in('role', ['schooladmin', 'teacher'])
    .order('role', { ascending: true })
    .order('full_name', { ascending: true })

  if (error) throw createError({ statusCode: 500, statusMessage: error.message })
  return data ?? []
})
