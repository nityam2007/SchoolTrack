// Restricts a route to platform super admins.
export default defineNuxtRouteMiddleware(() => requireRole('superadmin'))
