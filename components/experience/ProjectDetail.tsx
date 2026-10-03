'use client'

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { gsap, ScrollTrigger } from '@/lib/gsap'
import { S } from '@/lib/scroll-state'
import { useUI } from '@/lib/store'
import { getLenis } from '@/lib/lenis'
import { PROJECTS, DETAIL_SECTIONS } from '@/lib/content'

/**
 * PROJECT DETAIL — an immersive case-study overlay. Opening performs a
 * FLIP-style clip-path expansion from the clicked stage; the story inside
 * (Overview → Problem → Solution → Technology → Contribution → Result →
 * Learnings) is scroll-scrubbed against the overlay's own scroller.
 */
export default function ProjectDetail() {
  const detail = useUI((s) => s.detail)
  const [shown, setShown] = useState<number | null>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const railFill = useRef<HTMLSpanElement>(null)
  const railCount = useRef<HTMLSpanElement>(null)
  const lastFocused = useRef<HTMLElement | null>(null)
  const prevShown = useRef<number | null>(null)

  const setA11yHidden = useCallback((hidden: boolean) => {
    const els = [document.getElementById('main'), document.querySelector('header')]
    els.forEach((el) => {
      if (!el) return
      const e = el as HTMLElement & { inert?: boolean }
      try {
        e.inert = hidden
      } catch {
        /* older browsers */
      }
      el.setAttribute('aria-hidden', hidden ? 'true' : 'false')
    })
  }, [])

  const killTriggers = useCallback(() => {
    const scroller = scrollRef.current
    ScrollTrigger.getAll().forEach((st) => {
      if (scroller && (st.vars as { scroller?: Element }).scroller === scroller) st.kill()
    })
  }, [])

  const buildTriggers = useCallback(() => {
    const overlay = overlayRef.current
    const scroller = scrollRef.current
    if (!overlay || !scroller) return
    killTriggers()
    const reduced = useUI.getState().reducedMotion
    overlay.querySelectorAll<HTMLElement>('[data-block]').forEach((b) => {
      if (reduced) {
        gsap.set(b, { opacity: 1, y: 0 })
        return
      }
      gsap.fromTo(
        b,
        { y: 60, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          ease: 'none',
          scrollTrigger: { trigger: b, scroller, start: 'top 92%', end: 'top 55%', scrub: true },
        }
      )
    })
    const setFill = gsap.quickSetter(railFill.current, 'scaleY')
    ScrollTrigger.create({
      trigger: scroller.firstElementChild ?? scroller,
      scroller,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => {
        setFill(self.progress)
        if (railCount.current)
          railCount.current.textContent = String(
            Math.min(DETAIL_SECTIONS.length, Math.floor(self.progress * DETAIL_SECTIONS.length) + 1)
          ).padStart(2, '0')
      },
    })
  }, [killTriggers])

  /* open / close orchestration */
  useEffect(() => {
    const ui = useUI.getState()
    if (detail != null) {
      if (shown == null) {
        lastFocused.current = document.activeElement as HTMLElement
        setShown(detail)
        getLenis()?.stop()
        if (!getLenis()) document.documentElement.style.overflow = 'hidden'
        setA11yHidden(true)
        gsap.to(S, { detailOpen: 1, duration: 0.8, ease: 'power2.inOut' })
      } else if (detail !== shown) {
        /* switch to another project from inside the overlay */
        setShown(detail)
      }
      return
    }

    if (shown != null) {
      /* close: collapse to center, then unmount */
      killTriggers()
      gsap.to(S, { detailOpen: 0, duration: 0.6, ease: 'power2.inOut' })
      gsap
        .timeline({
          onComplete: () => {
            setShown(null)
            prevShown.current = null
            getLenis()?.start()
            document.documentElement.style.overflow = ''
            setA11yHidden(false)
            lastFocused.current?.focus?.()
          },
        })
        .to(scrollRef.current, { opacity: 0, y: -30, duration: 0.35, ease: 'power2.in' }, 0)
        .to(
          overlayRef.current,
          { clipPath: 'inset(50% 50% 50% 50% round 24px)', duration: 0.65, ease: 'power4.inOut' },
          0.1
        )
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [detail])

  /* build + animate whenever a project becomes shown */
  useLayoutEffect(() => {
    if (shown == null) return
    const overlay = overlayRef.current
    const scroller = scrollRef.current
    if (!overlay || !scroller) return

    const isSwitch = prevShown.current != null
    prevShown.current = shown

    if (!isSwitch) {
      /* FLIP: expand from the source stage's bounds */
      const srcEl = document.querySelector(`[data-stage="${shown}"]`)
      const rect = srcEl?.getBoundingClientRect()
      const fromClip = rect
        ? `inset(${Math.max(0, rect.top)}px ${Math.max(0, window.innerWidth - rect.right)}px ${Math.max(0, window.innerHeight - rect.bottom)}px ${Math.max(0, rect.left)}px round 20px)`
        : 'inset(100% 0% 0% 0%)'
      gsap.set(overlay, { clipPath: fromClip })
      gsap.set(scroller, { opacity: 0 })
      gsap
        .timeline()
        .to(overlay, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.85, ease: 'power4.inOut' }, 0)
        .to(scroller, { opacity: 1, duration: 0.45 }, 0.45)
    } else {
      scroller.scrollTop = 0
      gsap.fromTo(scroller, { opacity: 0 }, { opacity: 1, duration: 0.45 })
    }

    buildTriggers()
    window.setTimeout(() => closeRef.current?.focus(), isSwitch ? 100 : 900)
  }, [shown, buildTriggers])

  /* keyboard: Esc + focus trap */
  useEffect(() => {
    if (shown == null) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        useUI.getState().set({ detail: null })
      }
      if (e.key === 'Tab') {
        const focusables = overlayRef.current?.querySelectorAll<HTMLElement>(
          'button, a[href], [tabindex]:not([tabindex="-1"])'
        )
        if (!focusables || focusables.length === 0) return
        const first = focusables[0]
        const last = focusables[focusables.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [shown])

  if (shown == null) return null
  const project = PROJECTS[shown]
  const nextProject = PROJECTS[(shown + 1) % PROJECTS.length]

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[80]"
      role="dialog"
      aria-modal="true"
      aria-label={`${project.name} — case study`}
      style={{ clipPath: 'inset(100% 0% 0% 0%)' }}
    >
      <div className="absolute inset-0 bg-[#08080d]/[0.94] backdrop-blur-2xl" />

      {/* close */}
      <button
        ref={closeRef}
        type="button"
        aria-label="Close case study"
        onClick={() => useUI.getState().set({ detail: null })}
        className="neu absolute right-5 top-5 z-10 grid h-11 w-11 place-items-center rounded-full text-ink md:right-8 md:top-7"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
          <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      </button>

      {/* story progress rail */}
      <div className="absolute left-6 top-1/2 z-10 hidden -translate-y-1/2 flex-col items-center gap-3 md:flex">
        <span className="micro !text-faint">
          <span ref={railCount}>01</span>/{DETAIL_SECTIONS.length}
        </span>
        <span className="relative block h-24 w-px overflow-hidden bg-white/10">
          <span ref={railFill} className="absolute inset-x-0 top-0 h-full origin-top bg-accent" style={{ transform: 'scaleY(0)' }} />
        </span>
      </div>

      {/* the story */}
      <div ref={scrollRef} className="detail-scroll relative h-full overflow-y-auto overscroll-contain" data-lenis-prevent>
        <div className="mx-auto max-w-5xl px-6 pb-24 pt-24 md:px-10 md:pt-28">
          <div data-block>
            <p className="micro !text-accent-soft">{project.category} — Case study</p>
            <h2 className="mt-4 font-display text-[clamp(2.6rem,8vw,7rem)] font-bold leading-[0.95] tracking-tight">
              {project.name}
            </h2>
            <p className="mt-6 max-w-[52ch] text-sm leading-relaxed text-mute md:text-lg">{project.tagline}</p>

            <dl className="mt-10 grid grid-cols-2 gap-6 border-t border-white/10 pt-8 md:grid-cols-4">
              <div>
                <dt className="micro mb-2 !text-faint">Role</dt>
                <dd className="text-sm text-ink/90">{project.role}</dd>
              </div>
              <div>
                <dt className="micro mb-2 !text-faint">Year</dt>
                <dd className="text-sm text-ink/90">{project.year}</dd>
              </div>
              <div className="col-span-2">
                <dt className="micro mb-2.5 !text-faint">Stack</dt>
                <dd className="flex flex-wrap gap-2">
                  {project.tech.map((t) => (
                    <span key={t} className="micro rounded-full border border-white/10 px-3 py-1.5 !text-[9px] !tracking-[0.14em] !text-mute">
                      {t}
                    </span>
                  ))}
                </dd>
              </div>
            </dl>
          </div>

          {DETAIL_SECTIONS.map((sec, idx) => (
            <section key={sec.key} data-block className="mt-20 grid gap-4 md:mt-28 md:grid-cols-[180px_1fr] md:gap-10">
              <p className="micro !text-faint">
                {String(idx + 1).padStart(2, '0')} — {sec.label}
              </p>
              <p className="max-w-[62ch] text-sm leading-relaxed text-mute md:text-lg">{project.detail[sec.key]}</p>
            </section>
          ))}

          <div data-block className="mt-24 flex flex-wrap items-center justify-between gap-6 border-t border-white/10 pt-8">
            <button
              type="button"
              data-cursor="view"
              onClick={() => useUI.getState().set({ detail: (shown + 1) % PROJECTS.length })}
              className="neu micro rounded-full px-7 py-4 !text-ink"
            >
              Next project — {nextProject.name} <span className="ml-2 !text-accent-soft">→</span>
            </button>
            <button
              type="button"
              onClick={() => useUI.getState().set({ detail: null })}
              className="micro underline decoration-white/20 underline-offset-8 transition-colors hover:!text-ink"
            >
              Close case study ✕
            </button>
          </div>

          <p className="micro mt-14 text-center !text-faint">
            Part of an interactive portfolio — Suyash Pandey
          </p>
        </div>
      </div>
    </div>
  )
}
