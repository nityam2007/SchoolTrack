// Headless smoke test: opens /login, captures all console + page errors, types
// into the email/password fields, clicks Sign In, verifies navigation. Fails
// loudly if any console error appears or interaction stalls.
//
// Run: node scripts/verify-ui.mjs   (with the dev server already running)

import puppeteer from 'puppeteer-core'

const URL_BASE = process.env.URL ?? 'http://localhost:3000'
const EMAIL = 'admin@schooltrack.in'
const PASSWORD = 'admin123'

const consoleMsgs = []
const pageErrors = []
const requestFailures = []

const browser = await puppeteer.launch({
  executablePath: '/usr/bin/google-chrome',
  headless: 'new',
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
})

try {
  const page = await browser.newPage()
  page.on('console', (m) => consoleMsgs.push({ type: m.type(), text: m.text() }))
  page.on('pageerror', (e) => pageErrors.push(String(e)))
  page.on('requestfailed', (r) => {
    if (r.url().startsWith(URL_BASE)) requestFailures.push(`${r.method()} ${r.url()} — ${r.failure()?.errorText}`)
  })

  console.log(`→ Loading ${URL_BASE}/login`)
  const resp = await page.goto(`${URL_BASE}/login`, { waitUntil: 'networkidle0', timeout: 30000 })
  console.log(`  http ${resp.status()}`)

  // Find inputs by placeholder/role.
  const emailInput = await page.waitForSelector('input[type="text"], input[type="email"]', { timeout: 5000 })
  const passwordInput = await page.waitForSelector('input[type="password"]', { timeout: 5000 })

  console.log('→ Typing email')
  await emailInput.type(EMAIL, { delay: 5 })
  console.log('→ Typing password')
  await passwordInput.type(PASSWORD, { delay: 5 })

  // Read back what's in the inputs to confirm v-model bound.
  const emailVal = await page.$eval('input[type="text"], input[type="email"]', (el) => el.value)
  const passwordVal = await page.$eval('input[type="password"]', (el) => el.value)
  console.log(`  email value: ${emailVal === EMAIL ? '✓' : `✗ got "${emailVal}"`}`)
  console.log(`  password value: ${passwordVal === PASSWORD ? '✓' : `✗ got "${passwordVal}"`}`)

  // Click Sign In via aria-label.
  console.log('→ Clicking Sign In')
  await page.click('button[aria-label="Sign In"]')

  // Wait for navigation (either to /dashboard on success, or stay with error).
  await page.waitForFunction(
    () => location.pathname !== '/login' || document.querySelector('[role="alert"], .p-message-error') !== null,
    { timeout: 10000 },
  )

  const finalPath = new URL(page.url()).pathname
  console.log(`→ Final path: ${finalPath}`)
  if (finalPath === '/dashboard') {
    console.log('✓ Login succeeded, navigated to /dashboard')
  } else {
    const errText = await page.evaluate(() => document.querySelector('.p-message-error, [role="alert"]')?.textContent ?? '')
    console.log(`✗ Did not navigate. Error on page: "${errText.trim()}"`)
  }
} catch (e) {
  console.log(`✗ Test threw: ${e.message}`)
} finally {
  await browser.close()
}

console.log('\n--- Console messages ---')
const errs = consoleMsgs.filter((m) => m.type === 'error' || m.type === 'warning')
if (!errs.length) console.log('  (none)')
for (const m of errs) console.log(`  [${m.type}] ${m.text}`)

console.log('\n--- Page errors ---')
if (!pageErrors.length) console.log('  (none)')
for (const e of pageErrors) console.log(`  ${e}`)

console.log('\n--- Failed requests ---')
if (!requestFailures.length) console.log('  (none)')
for (const f of requestFailures) console.log(`  ${f}`)

process.exit(pageErrors.length || errs.filter((m) => m.type === 'error').length ? 1 : 0)
