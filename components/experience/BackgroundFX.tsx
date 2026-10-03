'use client'

import { useEffect, useRef } from 'react'
import { gsap } from '@/lib/gsap'
import { useUI, type SectionId } from '@/lib/store'

/**
 * BackgroundFX — atmosphere layer above the canvas, below the content:
 * a slow ambient accent glow that re-tints per chapter, film grain,
 * vignette and HUD corner ticks.
 */

const GLOWS: Record<SectionId, { c: string; o: number; s: number; y: number }> = {
  intro: { c: '#6d5cff', o: 0.09, s: 1, y: -30 },
  about: { c: '#5c7bff', o: 0.07, s: 1.08, y: 20 },
  experience: { c: '#7d5cf0', o: 0.08, s: 1.05, y: -10 },
  skills: { c: '#6d5cff', o: 0.085, s: 1, y: 0 },
  work: { c: '#5c8bff', o: 0.08, s: 1.06, y: 25 },
  contact: { c: '#8b5cff', o: 0.09, s: 1.02, y: 40 },
}

export default function BackgroundFX() {
  const glowRef = useRef<HTMLDivElement>(null)
  const active = useUI((s) => s.active)
  const xpIndex = useUI((s) => s.xpIndex)

  useEffect(() => {
    const base = GLOWS[active] ?? GLOWS.intro
    /* experience nodes nudge the hue slightly — "background changes subtly" */
    const nudge = active === 'experience' ? (xpIndex - 2) * 6 : 0
    const conf = { ...base, y: base.y + nudge * 4 }
    gsap.to(glowRef.current, {
      backgroundColor: conf.c,
      opacity: conf.o,
      scale: conf.s,
      y: conf.y,
      duration: 1.8,
      ease: 'power2.out',
      overwrite: 'auto',
    })
  }, [active, xpIndex])

  useEffect(() => {
    if (useUI.getState().reducedMotion) return
    const tw = gsap.to(glowRef.current, {
      xPercent: 3.5,
      duration: 16,
      yoyo: true,
      repeat: -1,
      ease: 'sine.inOut',
    })
    return () => {
      tw.kill()
    }
  }, [])

  return (
    <div className="pointer-events-none fixed inset-0 z-[2] overflow-hidden" aria-hidden="true">
      <div
        ref={glowRef}
        className="absolute left-1/2 top-1/2 h-[75vmax] w-[75vmax] rounded-full blur-[110px]"
        style={{ backgroundColor: '#6d5cff', opacity: 0.09, transform: 'translate(-50%, -50%)' }}
      />
      <div className="grain absolute -inset-[120px]" />
      <div
        className="absolute inset-0"
        style={{ background: 'radial-gradient(ellipse at center, transparent 52%, rgba(0,0,0,0.5) 100%)' }}
      />
      {/* HUD frame */}
      <span className="tick tick-tl" />
      <span className="tick tick-tr" />
      <span className="tick tick-bl" />
      <span className="tick tick-br" />
    </div>
  )
}
