// Restricts a route to teachers (and super admins for impersonation/audit).
export default defineNuxtRouteMiddleware(() => requireRole('teacher', 'superadmin'))
