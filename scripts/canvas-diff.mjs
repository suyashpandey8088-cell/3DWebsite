/**
 * WebGL visibility proof: screenshot each chapter with the canvas visible
 * and hidden, then measure pixel differences in key regions.
 */
import { chromium } from 'playwright'

const BASE = 'http://localhost:3000'
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
await page.goto(BASE, { waitUntil: 'load', timeout: 120000 })
await page.waitForFunction(() => window.__expReady === true, null, { timeout: 25000 })
await page.waitForTimeout(1800)

const jump = async (id, frac) => {
  await page.evaluate(({ id, frac }) => {
    const el = document.getElementById(id)
    const spacer = el.closest('.pin-spacer') || el
    const top = spacer.getBoundingClientRect().top + window.scrollY
    const dist = Math.max(0, spacer.offsetHeight - window.innerHeight)
    const l = window.__lenis
    if (l) l.scrollTo(Math.round(top + dist * frac), { immediate: true })
    else window.scrollTo(0, Math.round(top + dist * frac))
  }, { id, frac })
  await page.waitForTimeout(900)
}

const SCENES = [
  { key: 'hero', id: 'intro', frac: 0, region: { x: 0.36, y: 0.28, w: 0.28, h: 0.44 } },
  { key: 'xp', id: 'experience', frac: 0.5, region: { x: 0.38, y: 0.05, w: 0.24, h: 0.32 } },
  { key: 'work', id: 'work', frac: 0.12, region: { x: 0.55, y: 0.25, w: 0.3, h: 0.5 } },
  { key: 'contact', id: 'contact', frac: 0.75, region: { x: 0.3, y: 0.4, w: 0.4, h: 0.35 } },
  { key: 'end', id: 'end', frac: 0.8, region: { x: 0.35, y: 0.28, w: 0.3, h: 0.44 } },
]

const pairs = []
for (const s of SCENES) {
  await jump(s.id, s.frac)
  const a = await page.screenshot()
  await page.evaluate(() => (document.querySelector('canvas').parentNode.style.display = 'none'))
  await page.waitForTimeout(150)
  const b = await page.screenshot()
  await page.evaluate(() => (document.querySelector('canvas').parentNode.style.display = ''))
  pairs.push({ ...s, a: a.toString('base64'), b: b.toString('base64') })
}

const results = await page.evaluate(async (pairs) => {
  const load = (b64) =>
    new Promise((res) => {
      const img = new Image()
      img.onload = () => res(img)
      img.src = 'data:image/png;base64,' + b64
    })
  const out = []
  for (const p of pairs) {
    const a = await load(p.a)
    const b = await load(p.b)
    const c = document.createElement('canvas')
    c.width = a.width
    c.height = a.height
    const ctx = c.getContext('2d')
    ctx.drawImage(a, 0, 0)
    const da = ctx.getImageData(0, 0, c.width, c.height).data
    ctx.clearRect(0, 0, c.width, c.height)
    ctx.drawImage(b, 0, 0)
    const db = ctx.getImageData(0, 0, c.width, c.height).data
    const r = p.region
    const x0 = Math.floor(a.width * r.x)
    const y0 = Math.floor(a.height * r.y)
    const w = Math.floor(a.width * r.w)
    const h = Math.floor(a.height * r.h)
    let diffSum = 0
    let diffPixels = 0
    let samples = 0
    for (let y = y0; y < y0 + h; y += 2) {
      for (let x = x0; x < x0 + w; x += 2) {
        const i = (y * a.width + x) * 4
        const d = Math.abs(da[i] - db[i]) + Math.abs(da[i + 1] - db[i + 1]) + Math.abs(da[i + 2] - db[i + 2])
        diffSum += d
        if (d > 30) diffPixels++
        samples++
      }
    }
    out.push({
      scene: p.key,
      meanChannelDiff: +(diffSum / (samples * 3)).toFixed(1),
      changedPct: +((diffPixels / samples) * 100).toFixed(1),
    })
  }
  return out
}, pairs)

console.table(results)
await browser.close()
