// End-to-end: as a principal, send WhatsApp absence messages and confirm
// the trigger atomically decremented credits with NO RLS error surfaced.
//
// Prereq: a row in public.attendance for today + status='absent' for at
// least one student in the principal's school (the test script seeds this
// via psql before running).

import puppeteer from 'puppeteer-core'

const URL_BASE = process.env.URL ?? 'http://localhost:3000'
const EMAIL = 'principal@greenwood.edu'
const PASSWORD = 'school123'

const browser = await puppeteer.launch({
  executablePath: '/usr/bin/google-chrome',
  headless: 'new',
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
})

let fail = 0
try {
  const page = await browser.newPage()
  const errors = []
  page.on('pageerror', (e) => errors.push(`pageerror: ${e}`))
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(`[error] ${m.text()}`)
  })

  // Login
  await page.goto(`${URL_BASE}/login`, { waitUntil: 'networkidle0' })
  await page.type('input[type="text"], input[type="email"]', EMAIL, { delay: 5 })
  await page.type('input[type="password"]', PASSWORD, { delay: 5 })
  await page.click('button[aria-label="Sign In"]')
  await page.waitForFunction(() => location.pathname === '/dashboard', { timeout: 10000 })

  // Go to messages
  await page.goto(`${URL_BASE}/messages`, { waitUntil: 'networkidle0' })

  // Capture pre-send credits from the page header
  const preCredits = await page.evaluate(() => {
    const text = document.body.textContent || ''
    const m = text.match(/Credits:\s*(\d+)/)
    return m ? Number(m[1]) : null
  })
  console.log(`pre-send credits: ${preCredits}`)

  // Switch filter to "Entire School" so we don't depend on the default class.
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'))
    const eb = buttons.find((b) => b.textContent?.trim() === 'Entire School')
    if (eb) eb.click()
  })
  await new Promise((r) => setTimeout(r, 300))

  const sendButton = await page.evaluateHandle(() => {
    return Array.from(document.querySelectorAll('button')).find((b) =>
      /Send to \d+ Parent/.test(b.textContent || ''),
    )
  })
  if (!sendButton) throw new Error('Send button not found — no absentees today?')
  await sendButton.evaluate((b) => b.click())

  // Wait either for success toast or for an RLS error to surface as console error.
  await page.waitForFunction(
    () => {
      const t = document.body.textContent || ''
      return /Sent to \d+ parent\(s\)/i.test(t) || /violates row-level/i.test(t) || /Failed/i.test(t)
    },
    { timeout: 8000 },
  )

  const after = await page.evaluate(() => {
    const text = document.body.textContent || ''
    const cm = text.match(/Credits:\s*(\d+)/)
    return {
      credits: cm ? Number(cm[1]) : null,
      success: /Sent to \d+ parent\(s\)/i.test(text),
      rlsError: /violates row-level/i.test(text) || /violates row-level/i.test(JSON.stringify(text)),
    }
  })
  console.log(`post-send credits: ${after.credits} success=${after.success}`)

  if (after.rlsError) {
    console.log('✗ RLS error surfaced')
    fail++
  } else if (!after.success) {
    console.log('✗ No success toast detected')
    fail++
  } else if (preCredits != null && after.credits != null && after.credits >= preCredits) {
    console.log(`✗ Credits did not decrement: pre=${preCredits} post=${after.credits}`)
    fail++
  } else {
    console.log('✓ Send succeeded; credits decremented by trigger')
  }

  const rlsConsoleErrors = errors.filter((e) => /violates row-level/i.test(e))
  if (rlsConsoleErrors.length) {
    console.log(`✗ ${rlsConsoleErrors.length} RLS error(s) in console:`)
    rlsConsoleErrors.forEach((e) => console.log(`    ${e}`))
    fail += rlsConsoleErrors.length
  }
} catch (e) {
  console.log(`✗ test threw: ${e.message}`)
  fail++
} finally {
  await browser.close()
}
console.log(fail === 0 ? '✓ all clean' : `✗ ${fail} failure(s)`)
process.exit(fail === 0 ? 0 : 1)
