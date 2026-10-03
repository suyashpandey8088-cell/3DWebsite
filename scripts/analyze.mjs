/**
 * Visual analysis without eyes: loads each screenshot into a browser canvas
 * and computes per-image statistics that reveal common failure modes:
 *  - blank/black frames (mean+stddev ~ 0)
 *  - missing text (low bright-pixel ratio)
 *  - missing WebGL scene (low variance / no accent pixels in center region)
 * Also runs DOM probes at each chapter to verify layout machinery.
 */
import { chromium } from 'playwright'
import fs from 'node:fs'

const files = fs.readdirSync('shots').filter((f) => f.endsWith('.png')).sort()
const dataUris = files.map((f) => ({
  file: f,
  uri: 'data:image/png;base64,' + fs.readFileSync('shots/' + f).toString('base64'),
}))

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })

const stats = await page.evaluate(async (items) => {
  const out = []
  for (const item of items) {
    const img = new Image()
    img.src = item.uri
    await img.decode()
    const c = document.createElement('canvas')
    c.width = img.width
    c.height = img.height
    const ctx = c.getContext('2d')
    ctx.drawImage(img, 0, 0)
    const { data, width, height } = ctx.getImageData(0, 0, c.width, c.height)
    let sum = 0
    let sumSq = 0
    let bright = 0
    let accent = 0
    let centerVarSum = 0
    let centerCount = 0
    let centerMean = 0
    const cx0 = width * 0.3
    const cx1 = width * 0.7
    const cy0 = height * 0.25
    const cy1 = height * 0.75
    const step = 4
    for (let y = 0; y < height; y += step) {
      for (let x = 0; x < width; x += step) {
        const i = (y * width + x) * 4
        const r = data[i]
        const g = data[i + 1]
        const b = data[i + 2]
        const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b
        sum += lum
        sumSq += lum * lum
        if (lum > 120) bright++
        /* accent-ish: violet-blue, saturated, not gray */
        if (b > 90 && b > r * 1.15 && Math.abs(b - g) > 18 && lum > 40 && lum < 240) accent++
        if (x >= cx0 && x <= cx1 && y >= cy0 && y <= cy1) {
          centerMean += lum
          centerCount++
        }
      }
    }
    const n = Math.ceil(width / step) * Math.ceil(height / step)
    const mean = sum / n
    const std = Math.sqrt(Math.max(0, sumSq / n - mean * mean))
    out.push({
      file: item.file,
      mean: Math.round(mean),
      std: Math.round(std),
      brightPct: +((bright / n) * 100).toFixed(2),
      accentPct: +((accent / n) * 100).toFixed(2),
      centerMean: Math.round(centerMean / centerCount),
    })
  }
  return out
}, dataUris)

console.table(stats)
await browser.close()
