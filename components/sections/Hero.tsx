'use client'

import { useEffect, useRef } from 'react'
import { gsap, ScrollTrigger } from '@/lib/gsap'
import { S } from '@/lib/scroll-state'
import { useUI } from '@/lib/store'
import { useIsomorphicLayoutEffect } from '@/lib/hooks'
import { Chars } from '@/components/ui/Chars'
import { scrollToSection } from '@/lib/scroll'

/**
 * HERO — "Enter my world". The typographic layer separates, drifts and
 * blurs apart at different speeds while the 3D core recedes (canvas side).
 */
export default function Hero() {
  const root = useRef<HTMLElement>(null)
  const introTl = useRef<gsap.core.Timeline | null>(null)
  const played = useRef(false)

  useIsomorphicLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const q = gsap.utils.selector(root.current)
      const charsL1 = q('[data-line="1"] .char') as HTMLElement[]
      const charsL2 = q('[data-line="2"] .char') as HTMLElement[]
      const eyebrow = q('[data-hero="eyebrow"]')
      const disc = q('[data-hero="disc"]')
      const stmt = q('[data-hero="stmt"]')
      const cue = q('[data-hero="cue"]')
      const meta = q('[data-hero="meta"]') as HTMLElement[]
      const name = q('[data-hero="name"]')
      const reduced = useUI.getState().reducedMotion

      /* initial states (hidden until the preloader lifts) */
      if (!reduced) {
        gsap.set([...charsL1, ...charsL2], { yPercent: 118, rotate: 5 })
      }
      gsap.set([eyebrow, disc, stmt, cue, ...meta], { opacity: 0 })

      /* ── intro: plays once the preloader completes ── */
      introTl.current = gsap.timeline({ paused: true, defaults: { ease: 'power4.out' } })
      if (reduced) {
        introTl.current
          .to([eyebrow, disc, stmt, cue, ...meta], { opacity: 1, duration: 0.6, stagger: 0.06 }, 0)
          .to(S, { coreIntro: 1, duration: 0.8, ease: 'power2.out' }, 0)
      } else {
        introTl.current
          .to(charsL1, { yPercent: 0, rotate: 0, duration: 1.15, stagger: 0.035 }, 0)
          .to(charsL2, { yPercent: 0, rotate: 0, duration: 1.15, stagger: 0.04 }, 0.08)
          .to(eyebrow, { opacity: 1, y: 0, duration: 0.8 }, 0.5)
          .to(disc, { opacity: 1, duration: 0.8 }, 0.62)
          .to(stmt, { opacity: 1, duration: 0.9 }, 0.74)
          .to(meta, { opacity: 1, duration: 0.9, stagger: 0.1 }, 0.9)
          .to(cue, { opacity: 1, duration: 0.7 }, 1.05)
          .to(S, { coreIntro: 1, duration: 1.6, ease: 'power3.out' }, 0.1)
      }

      /* ── scroll transformation (fully reversible) ── */
      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: root.current,
          start: 'top top',
          end: '+=200%',
          pin: true,
          scrub: true,
          anticipatePin: 1,
          onUpdate: (self) => {
            S.hero = self.progress
          },
        },
      })
      if (reduced) {
        tl.to([eyebrow, disc, stmt, cue, ...meta], { opacity: 0, stagger: 0.02 }, 0)
      } else {
        tl.to(charsL1, { yPercent: -170, stagger: 0.012 }, 0)
          .to(charsL2, { yPercent: -100, x: (i: number) => (i % 2 ? 16 : -16), stagger: 0.008 }, 0.02)
          .to(eyebrow, { y: -90, opacity: 0 }, 0)
          .to(disc, { y: 90, opacity: 0, filter: 'blur(6px)' }, 0.04)
          .to(stmt, { y: 140, opacity: 0, filter: 'blur(12px)' }, 0.08)
          .to(meta, { opacity: 0, y: 24, stagger: 0.02 }, 0.02)
          .to(cue, { opacity: 0 }, 0)
      }

      /* active-section bookkeeping */
      ScrollTrigger.create({
        trigger: root.current,
        start: 'top 60%',
        end: 'bottom 40%',
        onToggle: (self) => {
          if (self.isActive) useUI.getState().set({ active: 'intro' })
        },
      })
    }, root)

    /* velocity-reactive skew — the headline leans into the scroll */
    const skewTarget = root.current?.querySelector<HTMLElement>('[data-hero="name"]')
    let skewTick: (() => void) | null = null
    if (skewTarget && !useUI.getState().reducedMotion) {
      const skewTo = gsap.quickTo(skewTarget, 'skewX', { duration: 0.6, ease: 'power3.out' })
      skewTick = () => skewTo(gsap.utils.clamp(-4, 4, S.velocity * 0.05))
      gsap.ticker.add(skewTick)
    }

    return () => {
      ctx.revert()
      if (skewTick) gsap.ticker.remove(skewTick)
    }
  }, [])

  /* play the intro when the world is ready */
  useEffect(() => {
    if (useUI.getState().ready && !played.current) {
      played.current = true
      introTl.current?.play()
    }
    const unsub = useUI.subscribe((s) => {
      if (s.ready && !played.current) {
        played.current = true
        introTl.current?.play()
      }
    })
    return unsub
  }, [])

  return (
    <section id="intro" ref={root} className="vh relative overflow-hidden" aria-label="Intro">
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
        <p data-hero="eyebrow" className="micro mb-6 md:mb-8">
          Creative technology portfolio — MMXXVI
        </p>
        <h1
          data-hero="name"
          aria-label="Suyash Pandey"
          className="font-display text-[clamp(3rem,13vw,11.5rem)] font-bold leading-[0.92] tracking-[-0.03em]"
        >
          <span className="line-mask">
            <span data-line="1" className="line">
              <Chars text="SUYASH" />
            </span>
          </span>
          <span className="line-mask">
            <span data-line="2" className="line">
              <Chars text="PANDEY" />
            </span>
          </span>
        </h1>
        <p data-hero="disc" className="micro mt-8 !text-accent-soft">
          AI • DATA • SOFTWARE • CREATIVE TECHNOLOGY
        </p>
        <p data-hero="stmt" className="mt-6 max-w-[46ch] text-sm leading-relaxed text-mute md:text-base">
          Building intelligent systems and digital experiences at the intersection of technology
          and creativity.
        </p>
      </div>

      {/* the core hotspot — "EXPLORE" */}
      <button
        type="button"
        data-cursor="explore"
        aria-label="Explore — jump to about"
        onClick={() => scrollToSection('about')}
        className="absolute left-1/2 top-1/2 h-[34vmin] w-[34vmin] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-0 focus-visible:opacity-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
      />

      <div data-hero="meta" className="micro absolute inset-x-0 bottom-6 flex justify-between px-6 md:px-10">
        <span>Based in Pune, India</span>
        <span className="hidden md:block">An interactive world — curiosity required</span>
        <span>Available — 2026</span>
      </div>

      <div data-hero="cue" className="absolute bottom-16 left-1/2 flex -translate-x-1/2 flex-col items-center gap-3">
        <span className="micro !text-[9px]">Scroll to explore</span>
        <span className="scroll-line">
          <span className="scroll-dot" />
        </span>
      </div>
    </section>
  )
}
