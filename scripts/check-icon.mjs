import puppeteer from 'puppeteer-core'
const browser = await puppeteer.launch({
  executablePath: '/usr/bin/google-chrome', headless: 'new',
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
})
const page = await browser.newPage()
await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle0' })
const info = await page.evaluate(() => {
  const input = document.querySelector('input[autocomplete="email"]')
  const wrap = input?.closest('.p-iconfield')
  const wrapChildren = wrap ? Array.from(wrap.children).map((c) => c.tagName + '.' + (c.className || '')) : []
  return {
    paddingLeft: getComputedStyle(input).paddingInlineStart,
    paddingLeftCss: getComputedStyle(input).paddingLeft,
    inputClasses: input?.className,
    matchesNotFirst: input?.matches('.p-iconfield .p-inputtext:not(:first-child)'),
    matchesIs: input?.matches('.p-iconfield .p-inputtext'),
    wrapChildren,
  }
})
console.log(info)
await browser.close()
