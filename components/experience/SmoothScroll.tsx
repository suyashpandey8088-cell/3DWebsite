'use client'

import { useEffect, type ReactNode } from 'react'
import Lenis from 'lenis'
import { gsap, ScrollTrigger } from '@/lib/gsap'
import { S } from '@/lib/scroll-state'
import { useUI } from '@/lib/store'
import { setLenis } from '@/lib/lenis'

/**
 * SmoothScroll — Lenis (momentum scrolling) wired into the GSAP ticker so
 * ScrollTrigger and Lenis share one clock. Falls back to native scroll for
 * reduced-motion users. Also owns the global pointer state.
 */
export default function SmoothScroll({ children }: { children: ReactNode }) {
  useEffect(() => {
    const reduced = useUI.getState().reducedMotion
    let lenis: Lenis | null = null
    const cleanups: Array<() => void> = []

    if (!reduced) {
      lenis = new Lenis({
        duration: 1.15,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        wheelMultiplier: 1,
        touchMultiplier: 1.5,
      })
      setLenis(lenis)
      ;(window as unknown as Record<string, unknown>).__lenis = lenis

      const onScroll = () => {
        S.velocity = lenis!.velocity
        S.direction = lenis!.direction
        S.progress = lenis!.progress ?? 0
        ScrollTrigger.update()
      }
      lenis.on('scroll', onScroll)

      const raf = (time: number) => lenis!.raf(time * 1000)
      gsap.ticker.add(raf)
      gsap.ticker.lagSmoothing(0)
      cleanups.push(() => {
        gsap.ticker.remove(raf)
        lenis!.destroy()
        setLenis(null)
      })
    } else {
      const onNative = () => {
        const max = document.documentElement.scrollHeight - window.innerHeight
        S.progress = max > 0 ? window.scrollY / max : 0
      }
      window.addEventListener('scroll', onNative, { passive: true })
      onNative()
      cleanups.push(() => window.removeEventListener('scroll', onNative))
    }

    /* global pointer tracking (canvas is pointer-events: none) */
    const onMove = (e: PointerEvent) => {
      S.pointer.x = (e.clientX / window.innerWidth) * 2 - 1
      S.pointer.y = (e.clientY / window.innerHeight) * 2 - 1
    }
    window.addEventListener('pointermove', onMove, { passive: true })

    const tick = () => {
      S.pointerSmooth.x += (S.pointer.x - S.pointerSmooth.x) * 0.06
      S.pointerSmooth.y += (S.pointer.y - S.pointerSmooth.y) * 0.06
      if (!lenis) S.velocity *= 0.9
    }
    gsap.ticker.add(tick)

    const onLoad = () => ScrollTrigger.refresh()
    window.addEventListener('load', onLoad)

    return () => {
      cleanups.forEach((fn) => fn())
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('load', onLoad)
      gsap.ticker.remove(tick)
    }
  }, [])

  return <>{children}</>
}
