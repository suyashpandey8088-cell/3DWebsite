'use client'

import { useEffect, useRef, useState } from 'react'
import { gsap } from '@/lib/gsap'
import { useUI, SECTIONS } from '@/lib/store'
import { S } from '@/lib/scroll-state'
import { getLenis } from '@/lib/lenis'
import { scrollToSection, backToTop } from '@/lib/scroll'
import { soundEngine } from '@/lib/sound'
import { useIsomorphicLayoutEffect } from '@/lib/hooks'

/**
 * NAVIGATION — persistent HUD: monogram + local time + sound + menu (top),
 * a vertical section rail with an animated active indicator (left),
 * a journey progress readout (bottom-right), and a full-screen mobile
 * menu that reveals with a clip-path sweep.
 */

function useClock() {
  const [time, setTime] = useState('')
  useEffect(() => {
    const fmt = () =>
      setTime(
        new Intl.DateTimeFormat('en-GB', {
          hour: '2-digit',
          minute: '2-digit',
          timeZone: 'Asia/Kolkata',
        }).format(new Date())
      )
    fmt()
    const id = window.setInterval(fmt, 20000)
    return () => window.clearInterval(id)
  }, [])
  return time
}

function SoundToggle() {
  const sound = useUI((s) => s.sound)
  useEffect(() => {
    if (sound) soundEngine.start()
    else soundEngine.stop()
  }, [sound])
  useEffect(() => {
    if (!sound) return
    let prev = useUI.getState().active
    const unsub = useUI.subscribe((s) => {
      if (s.active !== prev) {
        prev = s.active
        soundEngine.blip()
      }
    })
    return unsub
  }, [sound])
  return (
    <button
      type="button"
      className="neu grid h-10 w-10 place-items-center rounded-full"
      aria-pressed={sound}
      aria-label={sound ? 'Mute ambient sound' : 'Enable ambient sound'}
      title="Ambient sound (starts muted)"
      onClick={() => useUI.getState().set({ sound: !sound })}
    >
      <span className={`eq ${sound ? 'on' : ''}`} aria-hidden="true">
        <i />
        <i />
        <i />
      </span>
    </button>
  )
}

function MobileMenu() {
  const open = useUI((s) => s.menuOpen)
  const rootRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)

  useIsomorphicLayoutEffect(() => {
    const el = rootRef.current!
    const links = el.querySelectorAll('[data-mlink]')
    gsap.killTweensOf([el, ...links])
    if (open) {
      ;(el as unknown as HTMLElement & { inert: boolean }).inert = false
      el.style.pointerEvents = 'auto'
      el.setAttribute('aria-hidden', 'false')
      getLenis()?.stop()
      gsap
        .timeline()
        .to(el, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.7, ease: 'power4.inOut' }, 0)
        .fromTo(
          links,
          { y: 90, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.7, stagger: 0.06, ease: 'power4.out' },
          0.25
        )
      window.setTimeout(() => closeRef.current?.focus(), 450)
    } else {
      ;(el as unknown as HTMLElement & { inert: boolean }).inert = true
      el.style.pointerEvents = 'none'
      el.setAttribute('aria-hidden', 'true')
      gsap.to(el, { clipPath: 'inset(0% 0% 100% 0%)', duration: 0.6, ease: 'power4.inOut' })
      getLenis()?.start()
    }
  }, [open])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && useUI.getState().menuOpen) useUI.getState().set({ menuOpen: false })
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const go = (id: (typeof SECTIONS)[number]['id']) => {
    useUI.getState().set({ menuOpen: false })
    window.setTimeout(() => scrollToSection(id), 120)
  }

  return (
    <div
      id="mobile-menu"
      ref={rootRef}
      className="fixed inset-0 z-[70] md:hidden"
      style={{ clipPath: 'inset(0% 0% 100% 0%)' }}
      aria-hidden="true"
    >
      <div className="absolute inset-0 bg-bg/92 backdrop-blur-2xl" />
      <div className="relative flex h-full flex-col justify-center px-8">
        <p className="micro mb-8 !text-faint">Navigation</p>
        <nav aria-label="Mobile sections" className="flex flex-col gap-3">
          {SECTIONS.map((s, i) => (
            <button
              key={s.id}
              data-mlink
              type="button"
              onClick={() => go(s.id)}
              className="flex items-baseline gap-5 text-left"
            >
              <span className="micro !text-accent-soft">{String(i + 1).padStart(2, '0')}</span>
              <span className="font-display text-[11vw] font-bold leading-none tracking-tight">{s.label.toUpperCase()}</span>
            </button>
          ))}
        </nav>
        <div className="micro mt-12 flex justify-between !text-faint">
          <button type="button" onClick={() => go('contact')}>Contact →</button>
          <span>Pune, IN</span>
        </div>
      </div>
      <button
        ref={closeRef}
        type="button"
        aria-label="Close menu"
        onClick={() => useUI.getState().set({ menuOpen: false })}
        className="neu absolute right-5 top-5 grid h-11 w-11 place-items-center rounded-full text-ink"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
          <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      </button>
    </div>
  )
}

export default function Navigation() {
  const active = useUI((s) => s.active)
  const ready = useUI((s) => s.ready)
  const menuOpen = useUI((s) => s.menuOpen)
  const rootRef = useRef<HTMLDivElement>(null)
  const countRef = useRef<HTMLSpanElement>(null)
  const progressRef = useRef<HTMLSpanElement>(null)
  const time = useClock()

  /* reveal once the world is ready */
  useEffect(() => {
    if (ready) gsap.to(rootRef.current, { opacity: 1, duration: 1.2, delay: 0.4 })
  }, [ready])

  /* section counter */
  useEffect(() => {
    if (countRef.current) {
      countRef.current.textContent = String(SECTIONS.findIndex((s) => s.id === active) + 1).padStart(2, '0')
    }
  }, [active])

  /* journey progress hairline */
  useEffect(() => {
    const set = gsap.quickSetter(progressRef.current, 'scaleY')
    const tick = () => set(S.progress)
    gsap.ticker.add(tick)
    return () => gsap.ticker.remove(tick)
  }, [])

  return (
    <div ref={rootRef} className="opacity-0">
      {/* top bar */}
      <header className="pointer-events-none fixed inset-x-0 top-0 z-40 flex items-start justify-between px-5 py-5 md:px-8">
        <button
          type="button"
          onClick={backToTop}
          aria-label="Back to start"
          className="pointer-events-auto font-display text-lg font-bold tracking-tight"
        >
          SP<span className="text-accent">.</span>
        </button>
        <div className="pointer-events-auto flex items-center gap-3 md:gap-4">
          <span className="micro hidden !text-faint sm:block">
            Pune — {time} IST
          </span>
          <SoundToggle />
          <button
            type="button"
            className="neu grid h-10 w-10 place-items-center rounded-full md:hidden"
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label="Open menu"
            onClick={() => useUI.getState().set({ menuOpen: true })}
          >
            <span className="flex flex-col gap-[5px]" aria-hidden="true">
              <span className="block h-px w-4 bg-ink" />
              <span className="block h-px w-4 bg-ink" />
            </span>
          </button>
        </div>
      </header>

      {/* section rail (desktop) */}
      <nav
        aria-label="Sections"
        className="fixed left-7 top-1/2 z-40 hidden -translate-y-1/2 flex-col gap-5 md:flex"
      >
        {SECTIONS.map((s, i) => (
          <button
            key={s.id}
            type="button"
            className={`rail-btn ${active === s.id ? 'is-active' : ''}`}
            aria-current={active === s.id ? 'true' : undefined}
            onClick={() => scrollToSection(s.id)}
          >
            <span className="rail-line" aria-hidden="true" />
            <span className="micro !text-[9px] !text-faint">{String(i + 1).padStart(2, '0')}</span>
            <span className="micro rail-label !text-[9px]">{s.label}</span>
          </button>
        ))}
      </nav>

      {/* journey progress (bottom-right) */}
      <div className="pointer-events-none fixed bottom-6 right-5 z-40 flex items-center gap-4 md:right-8">
        <span className="micro !text-faint">
          <span ref={countRef}>01</span> / 06
        </span>
        <span className="relative block h-14 w-px overflow-hidden bg-white/10">
          <span
            ref={progressRef}
            className="absolute inset-x-0 top-0 h-full origin-top bg-accent"
            style={{ transform: 'scaleY(0)' }}
          />
        </span>
      </div>

      <MobileMenu />
    </div>
  )
}
