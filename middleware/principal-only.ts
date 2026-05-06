// Restricts a route to principals (and super admins).
export default defineNuxtRouteMiddleware(() => requireRole('schooladmin', 'superadmin'))
