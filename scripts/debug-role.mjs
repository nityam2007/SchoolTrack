import puppeteer from 'puppeteer-core'
const browser = await puppeteer.launch({
  executablePath: '/usr/bin/google-chrome',
  headless: 'new',
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
})
const page = await browser.newPage()
page.on('console', (m) => console.log(`[${m.type()}] ${m.text()}`))
await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle0' })
await page.type('input[type="text"], input[type="email"]', 'priya@greenwood.edu', { delay: 5 })
await page.type('input[type="password"]', 'teacher123', { delay: 5 })
await page.click('button[aria-label="Sign In"]')
await page.waitForFunction(() => location.pathname === '/dashboard', { timeout: 10000 })
console.log('--- now navigating to /schools as teacher ---')
await page.goto('http://localhost:3000/schools', { waitUntil: 'domcontentloaded' })
await new Promise((r) => setTimeout(r, 8000))
console.log('final path:', new URL(page.url()).pathname)
await browser.close()
