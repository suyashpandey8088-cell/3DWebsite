/**
 * Interaction probe: mobile menu, sound toggle, skills hover/focus,
 * magnetic cursor states, nav rail jumping.
 */
import { chromium } from 'playwright'

const BASE = 'http://localhost:3000'
const browser = await chromium.launch()
const errors = []

/* ── desktop interactions ── */
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
page.on('console', (m) => { if (m.type() === 'error') errors.push('[console] ' + m.text()) })
page.on('pageerror', (e) => errors.push('[pageerror] ' + e.message))
await page.goto(BASE, { waitUntil: 'load', timeout: 120000 })
await page.waitForFunction(() => window.__expReady === true, null, { timeout: 25000 })
await page.waitForTimeout(1800)

/* skills hover */
await page.evaluate(() => {
  const el = document.getElementById('skills')
  const spacer = el.closest('.pin-spacer') || el
  const top = spacer.getBoundingClientRect().top + window.scrollY
  const dist = spacer.offsetHeight - window.innerHeight
  window.__lenis.scrollTo(Math.round(top + dist * 0.5), { immediate: true })
})
await page.waitForTimeout(900)
const hubBefore = await page.evaluate(() => document.querySelector('.hub-swap.mt-2')?.textContent)
await page.evaluate(() => {
  const n = document.querySelectorAll('.skill-node')[2]
  n.dispatchEvent(new PointerEvent('pointerenter', { bubbles: false }))
})
await page.waitForTimeout(900)
const skillsHover = await page.evaluate(() => ({
  hubLabel: document.querySelector('.hub-swap.mt-2')?.textContent,
  nodeActive: !!document.querySelector('.skill-node.is-active'),
  ringDim: document.querySelector('.skill-ring')?.dataset.dim,
  lineOpacity: document.querySelector('.skill-line')?.style.opacity,
  cursorState: document.querySelector('.cursor-ring')?.dataset.state,
}))
console.log('SKILLS HOVER:', JSON.stringify({ hubBefore, ...skillsHover }))

/* click = select (persists), then deselect */
await page.evaluate(() => {
  const n = document.querySelectorAll('.skill-node')[2]
  n.dispatchEvent(new PointerEvent('pointerleave', { bubbles: false }))
  n.click()
})
await page.waitForTimeout(600)
const selected = await page.evaluate(() => ({
  hubLabel: document.querySelector('.hub-swap.mt-2')?.textContent,
  stillActive: !!document.querySelector('.skill-node.is-active'),
}))
console.log('SKILLS SELECT:', JSON.stringify(selected))

/* sound toggle */
const soundBefore = await page.evaluate(() => document.querySelector('[aria-pressed]')?.getAttribute('aria-pressed'))
await page.click('button[title*="Ambient"]')
await page.waitForTimeout(500)
const soundAfter = await page.evaluate(() => {
  const b = document.querySelector('button[title*="Ambient"]')
  return { pressed: b.getAttribute('aria-pressed'), barsOn: !!b.querySelector('.eq.on') }
})
console.log('SOUND:', JSON.stringify({ before: soundBefore, after: soundAfter }))
await page.click('button[title*="Ambient"]')
await page.waitForTimeout(300)

/* nav rail jump to work */
await page.click('.rail-btn >> nth=4')
await page.waitForTimeout(2600)
const navJump = await page.evaluate(() => ({
  active: document.querySelector('.rail-btn.is-active .rail-label')?.textContent,
  progress: +window.__lenis.progress.toFixed(3),
}))
console.log('NAV JUMP:', JSON.stringify(navJump))

/* cursor states */
const cursorCheck = await page.evaluate(() => document.querySelector('.cursor-ring')?.dataset.state)
console.log('CURSOR STATE (after nav):', JSON.stringify(cursorCheck))

/* ── mobile menu ── */
const m = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true })
m.on('console', (msg) => { if (msg.type() === 'error') errors.push('[m-console] ' + msg.text()) })
m.on('pageerror', (e) => errors.push('[m-pageerror] ' + e.message))
await m.goto(BASE, { waitUntil: 'load', timeout: 120000 })
await m.waitForFunction(() => window.__expReady === true, null, { timeout: 25000 })
await m.waitForTimeout(1500)
await m.click('button[aria-controls="mobile-menu"]')
await m.waitForTimeout(1200)
const menuOpen = await m.evaluate(() => {
  const menu = document.getElementById('mobile-menu')
  const clip = menu.style.clipPath
  return {
    clip,
    ariaHidden: menu.getAttribute('aria-hidden'),
    links: menu.querySelectorAll('[data-mlink]').length,
    firstLinkVisible: (() => {
      const l = menu.querySelector('[data-mlink]')
      return l ? +getComputedStyle(l).opacity : 0
    })(),
    btnExpanded: document.querySelector('button[aria-controls="mobile-menu"]')?.getAttribute('aria-expanded'),
  }
})
console.log('MENU OPEN:', JSON.stringify(menuOpen))

/* navigate via menu */
await m.click('[data-mlink] >> nth=4')
await m.waitForTimeout(1800)
const menuNav = await m.evaluate(() => ({
  menuClosed: document.getElementById('mobile-menu').style.clipPath.startsWith('inset(0% 0% 100'),
  scrollY: Math.round(window.scrollY),
}))
console.log('MENU NAV:', JSON.stringify(menuNav))

/* escape closes */
await m.click('button[aria-controls="mobile-menu"]')
await m.waitForTimeout(1000)
await m.keyboard.press('Escape')
await m.waitForTimeout(900)
const menuEsc = await m.evaluate(() => document.getElementById('mobile-menu').style.clipPath.startsWith('inset(0% 0% 100'))
console.log('MENU ESC CLOSES:', menuEsc)

console.log(errors.length ? '\nERRORS:\n' + errors.join('\n') : '\nNO CONSOLE ERRORS ✓')
await browser.close()
