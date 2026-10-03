'use client'

import { useEffect, useRef, useState } from 'react'
import { gsap, ScrollTrigger } from '@/lib/gsap'
import { useUI } from '@/lib/store'
import { getLenis } from '@/lib/lenis'

/**
 * PRELOADER — "INITIALIZING EXPERIENCE…". A short, honest load sequence
 * (fonts + first WebGL frame + a minimum beat). Skips ahead if assets
 * arrive early; force-finishes if WebGL never reports in. Exit: the
 * counter blurs away and five panels slide up to reveal the world.
 */
export default function Preloader() {
  const [gone, setGone] = useState(false)
  const numRef = useRef<HTMLSpanElement>(null)
  const barRef = useRef<HTMLSpanElement>(null)
  const stepRef = useRef<HTMLParagraphElement>(null)
  const wrapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (useUI.getState().ready) {
      setGone(true)
      return
    }

    const reduced = useUI.getState().reducedMotion
    const start = Date.now()
    const minMs = reduced ? 120 : 1500

    getLenis()?.stop()
    document.documentElement.classList.add('is-loading')

    const state = { fonts: false, canvas: false, min: false, done: false }
    const progress = { v: 0 }

    const stepFor = (v: number) =>
      v < 25 ? 'INITIALIZING' : v < 55 ? 'LOADING ASSETS' : v < 92 ? 'BUILDING WORLD' : 'READY'

    const render = () => {
      if (numRef.current) numRef.current.textContent = String(Math.round(progress.v)).padStart(3, '0')
      if (barRef.current) barRef.current.style.transform = `scaleX(${progress.v / 100})`
      if (stepRef.current) stepRef.current.textContent = stepFor(progress.v)
    }

    const warm = gsap.to(progress, { v: 90, duration: reduced ? 0.35 : 2.3, ease: 'power2.out', onUpdate: render })

    const finish = () => {
      if (state.done) return
      state.done = true
      warm.kill()
      clearTimeout(failSafe)
      gsap.to(progress, {
        v: 100,
        duration: 0.45,
        ease: 'power2.inOut',
        onUpdate: render,
        onComplete: exit,
      })
    }

    const check = () => {
      if (!state.done && state.fonts && state.canvas && state.min) finish()
    }

    const fontsPromise: Promise<void> =
      typeof document !== 'undefined' && document.fonts
        ? document.fonts.ready.then(() => undefined)
        : Promise.resolve()
    fontsPromise
      .then(() => {
        state.fonts = true
        check()
      })
      .catch(() => {
        state.fonts = true
        check()
      })

    const unsub = useUI.subscribe((s) => {
      if (s.canvasReady && !state.canvas) {
        state.canvas = true
        check()
      }
    })

    const minTimer = window.setTimeout(() => {
      state.min = true
      check()
    }, minMs)

    /* never hold the world hostage */
    const failSafe = window.setTimeout(() => {
      state.canvas = true
      state.fonts = true
      state.min = true
      check()
    }, 6000)

    function exit() {
      const panels = wrapRef.current?.querySelectorAll('[data-panel]') ?? []
      const tl = gsap.timeline({
        onComplete: () => {
          unsub()
          clearTimeout(minTimer)
          document.documentElement.classList.remove('is-loading')
          getLenis()?.start()
          useUI.getState().set({ ready: true })
          ;(window as unknown as Record<string, unknown>).__expReady = true
          ScrollTrigger.refresh()
          setGone(true)
        },
      })
      tl.to('[data-pre-inner]', { opacity: 0, y: -26, filter: 'blur(8px)', duration: 0.5, ease: 'power2.in' }, 0)
        .to(panels, { yPercent: -100, duration: 0.9, ease: 'power4.inOut', stagger: 0.055 }, 0.3)
      /* the hero intro starts while the panels are still lifting */
      tl.call(() => useUI.getState().set({ ready: true }), undefined, 0.55)
      /* second refresh after the world settles (fonts, spacers, overlay fonts) */
      tl.call(() => ScrollTrigger.refresh(), undefined, 1.05)
    }

    return () => {
      unsub()
      clearTimeout(minTimer)
      clearTimeout(failSafe)
      warm.kill()
    }
  }, [])

  if (gone) return null

  return (
    <div ref={wrapRef} className="fixed inset-0 z-[100]" aria-hidden="true">
      <div className="absolute inset-0 flex">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} data-panel className="flex-1 border-r border-white/[0.03] bg-bg last:border-r-0" />
        ))}
      </div>

      <div data-pre-inner className="absolute inset-0 flex flex-col items-center justify-center">
        <p className="micro mb-5 !text-faint">Suyash Pandey — Portfolio</p>
        <p className="font-display text-xs uppercase tracking-[0.35em] text-mute md:text-sm">
          Initializing experience
          <span className="ml-1 inline-flex gap-1 align-baseline">
            <i className="animate-pulse">.</i>
            <i className="animate-pulse [animation-delay:0.2s]">.</i>
            <i className="animate-pulse [animation-delay:0.4s]">.</i>
          </span>
        </p>
        <div className="mt-8 h-px w-56 overflow-hidden bg-white/10 md:w-72">
          <span ref={barRef} className="block h-full origin-left bg-accent" style={{ transform: 'scaleX(0)' }} />
        </div>
        <p ref={stepRef} className="micro mt-4 !text-accent-soft">
          INITIALIZING
        </p>
        <span
          ref={numRef}
          className="absolute bottom-6 right-8 font-mono text-6xl font-bold tabular-nums text-white/10 md:text-8xl"
        >
          000
        </span>
      </div>
    </div>
  )
}
