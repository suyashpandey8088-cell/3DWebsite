/**
 * DOM probes — verifies the scroll machinery state at each chapter:
 * pinned spacers, plate opacities, skills ring transforms, track offsets,
 * canvas presence, overlay open/close, focus trap.
 */
import { chromium } from 'playwright'

const BASE = 'http://localhost:3000'
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
const errors = []
page.on('console', (m) => { if (m.type() === 'error') errors.push('[console] ' + m.text()) })
page.on('pageerror', (e) => errors.push('[pageerror] ' + e.message))

await page.goto(BASE, { waitUntil: 'load', timeout: 120000 })
await page.waitForFunction(() => window.__expReady === true, null, { timeout: 25000 })
await page.waitForTimeout(1500)

const jump = async (id, frac) => {
  await page.evaluate(({ id, frac }) => {
    const el = document.getElementById(id)
    const spacer = el.closest('.pin-spacer') || el
    const top = spacer.getBoundingClientRect().top + window.scrollY
    const dist = Math.max(0, spacer.offsetHeight - window.innerHeight)
    const y = Math.round(top + dist * frac)
    const l = window.__lenis
    if (l) l.scrollTo(y, { immediate: true })
    else window.scrollTo(0, y)
  }, { id, frac })
  await page.waitForTimeout(700)
}

const report = await page.evaluate(() => {
  const r = {}
  r.canvases = [...document.querySelectorAll('canvas')].map((c) => ({ w: c.width, h: c.height }))
  r.pinSpacers = document.querySelectorAll('.pin-spacer').length
  r.sections = [...document.querySelectorAll('main section')].map((s) => s.id)
  r.hScroll = document.documentElement.scrollWidth > window.innerWidth
  r.cursorDot = !!document.querySelector('.cursor-dot')
  r.hasCursorClass = document.documentElement.classList.contains('has-cursor')
  return r
})
console.log('GLOBAL', JSON.stringify(report, null, 1))

/* About plates at fractions */
for (const frac of [0.2, 0.35, 0.5, 0.65, 0.8, 0.95]) {
  await jump('about', frac)
  const plates = await page.evaluate(() =>
    [...document.querySelectorAll('[data-plate]')].map((p) => +(+getComputedStyle(p).opacity).toFixed(2))
  )
  console.log(`ABOUT ${frac}:`, JSON.stringify(plates))
}

/* Skills */
for (const frac of [0.2, 0.7]) {
  await jump('skills', frac)
  const skills = await page.evaluate(() => {
    const ring = document.querySelector('.skill-ring')
    const nodes = [...document.querySelectorAll('.skill-node')]
    const hub = document.querySelector('[data-hub], .glass.rounded-full')
    return {
      ringTransform: ring?.style.transform,
      ringOpacity: ring?.style.opacity,
      nodeCount: nodes.length,
      nodeFirstVisible: nodes.map((n) => {
        const f = n.querySelector('.node-fade')
        return +(f?.style.opacity || 0)
      }).slice(0, 3),
      nodeRects: nodes.slice(0, 2).map((n) => {
        const b = n.getBoundingClientRect()
        return [Math.round(b.x), Math.round(b.y)]
      }),
      hubOpacity: hub ? getComputedStyle(hub).opacity : null,
    }
  })
  console.log(`SKILLS ${frac}:`, JSON.stringify(skills))
}

/* Work track + stage rects */
await jump('work', 0.1)
const work = await page.evaluate(() => {
  const track = document.querySelector('#work [data-work-bar]')?.closest('section')?.querySelector('.w-max') || document.querySelector('#work .w-max')
  const stages = [...document.querySelectorAll('[data-stage]')]
  return {
    trackX: track ? getComputedStyle(track).transform : null,
    stage0: stages[0] ? JSON.parse(JSON.stringify(stages[0].getBoundingClientRect())) : null,
    stage0Opacity: stages[0] ? getComputedStyle(stages[0]).opacity : null,
  }
})
console.log('WORK 0.25:', JSON.stringify(work))

/* Experience active node */
await jump('experience', 0.5)
const xp = await page.evaluate(() => {
  const counter = document.querySelector('#experience span')
  const nodes = [...document.querySelectorAll('[data-node]')].map((n) => +(+getComputedStyle(n).opacity).toFixed(2))
  return { nodes }
})
console.log('XP 0.5:', JSON.stringify(xp))

/* Detail overlay via real click at coordinates */
await jump('work', 0.1)
await page.waitForTimeout(400)
const clicked = await page.evaluate(() => {
  const stage = document.querySelector('[data-stage="0"]')
  if (!stage) return 'no stage'
  const b = stage.getBoundingClientRect()
  const el = document.elementFromPoint(b.left + b.width * 0.5, b.top + b.height * 0.5)
  if (!el) return 'no element at point'
  const art = el.closest('article[data-stage]')
  if (!art) return 'point not over stage: ' + el.tagName + '.' + el.className
  art.click()
  return 'clicked stage'
})
console.log('DETAIL CLICK:', clicked)
await page.waitForTimeout(1400)
const overlay = await page.evaluate(() => {
  const d = document.querySelector('[role="dialog"]')
  if (!d) return { open: false }
  return {
    open: true,
    label: d.getAttribute('aria-label'),
    clip: d.style.clipPath,
    closeFocused: document.activeElement?.getAttribute('aria-label'),
    mainAriaHidden: document.getElementById('main')?.getAttribute('aria-hidden'),
    scrollHeight: d.querySelector('.detail-scroll')?.scrollHeight,
    blocks: d.querySelectorAll('[data-block]').length,
  }
})
console.log('OVERLAY:', JSON.stringify(overlay))

/* scroll inside overlay, check scrub reveals */
await page.evaluate(() => {
  const sc = document.querySelector('.detail-scroll')
  if (sc) sc.scrollTop = sc.scrollHeight * 0.5
})
await page.waitForTimeout(500)
const midBlock = await page.evaluate(() => {
  const blocks = [...document.querySelectorAll('[role="dialog"] [data-block]')]
  const mid = blocks[Math.floor(blocks.length / 2)]
  return mid ? { opacity: getComputedStyle(mid).opacity, y: getComputedStyle(mid).transform } : null
})
console.log('OVERLAY MID BLOCK:', JSON.stringify(midBlock))

/* Escape + focus return */
await page.keyboard.press('Escape')
await page.waitForTimeout(1100)
const closed = await page.evaluate(() => ({
  dialogGone: !document.querySelector('[role="dialog"]'),
  mainAriaHidden: document.getElementById('main')?.getAttribute('aria-hidden'),
  focusTag: document.activeElement?.tagName,
}))
console.log('CLOSED:', JSON.stringify(closed))

/* Back-to-top smooth ride */
await jump('end', 0.8)
const endInfo = await page.evaluate(() => {
  const chars = [...document.querySelectorAll('#end .char')].slice(0, 6)
  return { charsVisible: chars.filter((c) => +getComputedStyle(c.closest('.line')).transform.split(',')[5] > -50).length }
})
console.log('END SCENE:', JSON.stringify(endInfo))

console.log(errors.length ? '\nERRORS:\n' + errors.join('\n') : '\nNO CONSOLE ERRORS ✓')
await browser.close()
