/**
 * E2E screenshot harness — loads the experience, waits for the preloader,
 * jumps through every chapter (via the exposed Lenis instance), captures
 * desktop + mobile screenshots and reports console errors.
 *
 * Usage: node scripts/shots.mjs
 */
import { chromium } from 'playwright'
import fs from 'node:fs'

const BASE = 'http://localhost:3000'
fs.mkdirSync('shots', { recursive: true })

const browser = await chromium.launch()
const errors = []

const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
page.on('console', (m) => { if (m.type() === 'error') errors.push('[console] ' + m.text()) })
page.on('pageerror', (e) => errors.push('[pageerror] ' + e.message))

await page.goto(BASE, { waitUntil: 'load', timeout: 120000 })
await page
  .waitForFunction(() => window.__expReady === true, null, { timeout: 25000 })
  .catch(() => errors.push('[preload] ready flag never set'))
await page.waitForTimeout(2200)

const posOf = (id, frac) =>
  page.evaluate(({ id, frac }) => {
    const el = document.getElementById(id)
    if (!el) return 0
    const spacer = el.closest('.pin-spacer') || el
    const top = spacer.getBoundingClientRect().top + window.scrollY
    const dist = Math.max(0, spacer.offsetHeight - window.innerHeight)
    return Math.round(top + dist * frac)
  }, { id, frac })

const shot = async (name, y) => {
  await page.evaluate((y) => {
    const l = window.__lenis
    if (l) l.scrollTo(y, { immediate: true })
    else window.scrollTo(0, y)
  }, y)
  await page.waitForTimeout(1000)
  await page.screenshot({ path: `shots/${name}.png` })
  console.log('shot:', name)
}

await shot('01-hero', 0)
await shot('02-hero-mid', await posOf('intro', 0.55))
await shot('03-about-early', await posOf('about', 0.06))
await shot('04-about-mid', await posOf('about', 0.5))
await shot('05-about-late', await posOf('about', 0.93))
await shot('06-xp-1', await posOf('experience', 0.1))
await shot('07-xp-2', await posOf('experience', 0.5))
await shot('08-xp-3', await posOf('experience', 0.85))
await shot('09-skills-a', await posOf('skills', 0.2))
await shot('10-skills-b', await posOf('skills', 0.7))
await shot('11-skills-scatter', await posOf('skills', 0.97))
await shot('12-work-1', await posOf('work', 0.12))
await shot('13-work-2', await posOf('work', 0.55))
await shot('14-contact', await posOf('contact', 0.6))
await shot('15-end', await posOf('end', 0.8))

/* case study overlay */
await shot('16-work-stage', await posOf('work', 0.12))
await page.mouse.move(720, 450)
await page.click('[data-stage="0"]', { timeout: 5000 }).catch((e) => errors.push('[click] ' + e.message))
await page.waitForTimeout(1800)
await page.screenshot({ path: 'shots/17-detail.png' })
console.log('shot: 17-detail')
await page.keyboard.press('Escape')
await page.waitForTimeout(1200)

/* mobile */
const m = await browser.newPage({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 1,
  isMobile: true,
  hasTouch: true,
})
m.on('console', (msg) => { if (msg.type() === 'error') errors.push('[m-console] ' + msg.text()) })
m.on('pageerror', (e) => errors.push('[m-pageerror] ' + e.message))
await m.goto(BASE, { waitUntil: 'load', timeout: 120000 })
await m.waitForFunction(() => window.__expReady === true, null, { timeout: 25000 }).catch(() => {})
await m.waitForTimeout(1800)
await m.screenshot({ path: 'shots/18-mobile-hero.png' })
console.log('shot: 18-mobile-hero')
await m.evaluate(() => {
  const l = window.__lenis
  if (l) l.scrollTo(window.innerHeight * 9, { immediate: true })
  else window.scrollTo(0, window.innerHeight * 9)
})
await m.waitForTimeout(1000)
await m.screenshot({ path: 'shots/19-mobile-xp.png' })
console.log('shot: 19-mobile-xp')

/* reduced motion smoke test */
const rm = await browser.newPage({ viewport: { width: 1440, height: 900 } })
rm.on('pageerror', (e) => errors.push('[rm-pageerror] ' + e.message))
await rm.emulateMedia({ reducedMotion: 'reduce' })
await rm.goto(BASE, { waitUntil: 'load', timeout: 120000 })
await rm.waitForFunction(() => window.__expReady === true, null, { timeout: 25000 }).catch(() => errors.push('[rm] ready flag never set'))
await rm.waitForTimeout(1200)
await rm.screenshot({ path: 'shots/20-reduced-motion.png' })
console.log('shot: 20-reduced-motion')

console.log(errors.length ? '\nERRORS:\n' + errors.join('\n') : '\nNO CONSOLE ERRORS ✓')
await browser.close()
