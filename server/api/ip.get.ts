// Returns the caller's IP so the client can stamp audit rows with it.
export default defineEventHandler((event) => {
  const ip =
    getRequestIP(event, { xForwardedFor: true }) ||
    getRequestHeader(event, 'x-real-ip') ||
    ''
  return { ip }
})
