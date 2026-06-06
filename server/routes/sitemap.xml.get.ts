// Dynamic sitemap for crawlers / AI agents.
export default defineEventHandler((event) => {
  const base = 'https://skooltrack.in'
  const routes = [
    '/', '/login', '/dashboard',
    '/schools', '/credits', '/analytics',
    '/students', '/teachers', '/classes', '/subjects',
    '/attendance', '/mark-attendance', '/my-class',
    '/report-cards', '/messages', '/holidays',
    '/billing', '/logs', '/settings',
  ]
  const urls = routes
    .map((r) => `  <url><loc>${base}${r}</loc><changefreq>weekly</changefreq></url>`)
    .join('\n')
  setHeader(event, 'content-type', 'application/xml; charset=utf-8')
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`
})
