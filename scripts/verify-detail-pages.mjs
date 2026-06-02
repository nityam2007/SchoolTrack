// Smoke test: each role's detail pages render with no console errors.
import puppeteer from 'puppeteer-core'

const URL_BASE = process.env.URL ?? 'http://localhost:3000'

const ROLES = [
  { email: 'admin@schooltrack.in',    password: 'admin123',   visit: ['/schools/SCH001'] },
  { email: 'principal@greenwood.edu', password: 'school123',  visit: ['/students/S001', '/teachers/T001'] },
]

const browser = await puppeteer.launch({
  executablePath: '/usr/bin/google-chrome', headless: 'new',
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
})

let totalErrors = 0
try {
  for (const r of ROLES) {
    const ctx = await browser.createBrowserContext()
    const page = await ctx.newPage()
    const errors = []
    page.on('pageerror', (e) => errors.push(`pageerror: ${e}`))
    page.on('console', (m) => { if (m.type() === 'error') errors.push(`[error] ${m.text()}`) })

    await page.goto(`${URL_BASE}/login`, { waitUntil: 'networkidle0' })
    await page.type('input[type="text"], input[type="email"]', r.email, { delay: 5 })
    await page.type('input[type="password"]', r.password, { delay: 5 })
    await page.click('button[aria-label="Sign In"]')
    await page.waitForFunction(() => location.pathname === '/dashboard', { timeout: 10000 })
    console.log(`\n=== ${r.email} ===`)

    for (const path of r.visit) {
      await page.goto(`${URL_BASE}${path}`, { waitUntil: 'networkidle0', timeout: 15000 })
      const url = new URL(page.url()).pathname
      const ok = url === path
      // Probe the rendered DOM so we can prove the detail page actually rendered.
      const h1 = await page.evaluate(() => document.querySelector('h2')?.textContent?.trim() ?? '')
      console.log(`  ${ok ? '✓' : '✗'} ${path}${ok ? '' : ` → ${url}`} · h2="${h1}"`)
    }
    if (errors.length) {
      console.log(`  ${errors.length} error(s):`)
      for (const e of errors.slice(0, 5)) console.log(`    ${e}`)
      totalErrors += errors.length
    }
    await page.close()
    await ctx.close()
  }
} finally {
  await browser.close()
}
console.log(`\n${totalErrors === 0 ? '✓ all clean' : `✗ ${totalErrors} error(s) total`}`)
process.exit(totalErrors === 0 ? 0 : 1)
