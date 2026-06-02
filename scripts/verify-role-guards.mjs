// Verify cross-role access is correctly bounced to /dashboard.
// Teacher hitting principal-only routes; principal hitting super-only.
import puppeteer from 'puppeteer-core'

const URL_BASE = process.env.URL ?? 'http://localhost:3000'

const CASES = [
  {
    email: 'priya@greenwood.edu', password: 'teacher123',
    forbidden: ['/schools', '/credits', '/analytics', '/teachers', '/students', '/holidays', '/messages', '/reports'],
  },
  {
    email: 'principal@greenwood.edu', password: 'school123',
    forbidden: ['/schools', '/credits', '/analytics', '/mark-attendance', '/my-class'],
  },
]

const browser = await puppeteer.launch({
  executablePath: '/usr/bin/google-chrome',
  headless: 'new',
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
})

let fail = 0
try {
  for (const c of CASES) {
    const ctx = await browser.createBrowserContext()
    const page = await ctx.newPage()
    await page.goto(`${URL_BASE}/login`, { waitUntil: 'networkidle0' })
    await page.type('input[type="text"], input[type="email"]', c.email, { delay: 5 })
    await page.type('input[type="password"]', c.password, { delay: 5 })
    await page.click('button[aria-label="Sign In"]')
    await page.waitForFunction(() => location.pathname === '/dashboard', { timeout: 10000 })
    console.log(`\n=== ${c.email} ===`)
    for (const path of c.forbidden) {
      await page.goto(`${URL_BASE}${path}`, { waitUntil: 'domcontentloaded', timeout: 15000 })
      // Wait for the client-side hydration redirect, or time out.
      try {
        await page.waitForFunction(
          (forbidden) => location.pathname !== forbidden,
          { timeout: 6000 },
          path,
        )
      } catch { /* will fall through and report below */ }
      const finalPath = new URL(page.url()).pathname
      const ok = finalPath === '/dashboard'
      console.log(`  ${ok ? '✓' : '✗'} ${path} → ${finalPath}`)
      if (!ok) fail++
    }
    await page.close()
    await ctx.close()
  }
} finally {
  await browser.close()
}
console.log(`\n${fail === 0 ? '✓ all role guards correct' : `✗ ${fail} role-guard failure(s)`}`)
process.exit(fail === 0 ? 0 : 1)
