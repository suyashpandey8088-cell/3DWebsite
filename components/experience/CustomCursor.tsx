'use client'

import { useEffect, useRef } from 'react'
import { gsap } from '@/lib/gsap'
import { useUI } from '@/lib/store'

/**
 * CustomCursor — dot + trailing ring, context-aware:
 * VIEW over projects, OPEN over external links, EXPLORE over the core.
 * Desktop (fine pointer) only; disabled for reduced motion.
 */
export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)
  const labelRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const fine = window.matchMedia('(pointer: fine)').matches
    const reduced = useUI.getState().reducedMotion
    if (!fine || reduced) return

    const dot = dotRef.current!
    const ring = ringRef.current!
    const label = labelRef.current!
    document.documentElement.classList.add('has-cursor')

    let x = -100
    let y = -100
    let rx = -100
    let ry = -100
    let scale = 1
    let targetScale = 1
    let pressed = false
    let state = ''

    const LABELS = ['view', 'open', 'explore']

    const onMove = (e: PointerEvent) => {
      x = e.clientX
      y = e.clientY
      dot.style.opacity = '1'
      ring.style.opacity = '1'
    }

    const onOver = (e: MouseEvent) => {
      const t = e.target as Element | null
      if (!t || typeof t.closest !== 'function') return
      const special = t.closest<HTMLElement>('[data-cursor]')
      let next: string
      if (special) next = special.dataset.cursor || ''
      else next = t.closest('a, button, [role="button"], input, select, textarea') ? 'link' : ''
      if (next !== state) {
        state = next
        ring.dataset.state = state
        if (LABELS.includes(state)) label.textContent = state.toUpperCase()
        targetScale = LABELS.includes(state) ? 2.3 : state === 'link' ? 1.5 : 1
        dot.style.opacity = LABELS.includes(state) ? '0' : '1'
      }
    }

    const onDown = () => {
      pressed = true
    }
    const onUp = () => {
      pressed = false
    }
    const onLeave = () => {
      dot.style.opacity = '0'
      ring.style.opacity = '0'
    }

    const tick = () => {
      rx += (x - rx) * 0.16
      ry += (y - ry) * 0.16
      const s = pressed ? targetScale * 0.82 : targetScale
      scale += (s - scale) * 0.2
      dot.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`
      ring.style.transform = `translate3d(${rx}px, ${ry}px, 0) translate(-50%, -50%) scale(${scale})`
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    document.addEventListener('mouseover', onOver)
    window.addEventListener('pointerdown', onDown)
    window.addEventListener('pointerup', onUp)
    document.documentElement.addEventListener('mouseleave', onLeave)
    gsap.ticker.add(tick)

    return () => {
      document.documentElement.classList.remove('has-cursor')
      window.removeEventListener('pointermove', onMove)
      document.removeEventListener('mouseover', onOver)
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointerup', onUp)
      document.documentElement.removeEventListener('mouseleave', onLeave)
      gsap.ticker.remove(tick)
    }
  }, [])

  return (
    <>
      <div ref={dotRef} className="cursor-dot" style={{ opacity: 0 }} aria-hidden="true" />
      <div ref={ringRef} className="cursor-ring" data-state="" style={{ opacity: 0 }} aria-hidden="true">
        <span ref={labelRef} className="cursor-label" />
      </div>
    </>
  )
}
