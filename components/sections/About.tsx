'use client'

import { useRef } from 'react'
import { gsap, ScrollTrigger } from '@/lib/gsap'
import { S } from '@/lib/scroll-state'
import { useUI } from '@/lib/store'
import { useIsomorphicLayoutEffect } from '@/lib/hooks'
import { Chars } from '@/components/ui/Chars'
import { ABOUT_PLATES } from '@/lib/content'

/**
 * ABOUT — "The human behind the system". A pinned sequence of layered
 * plates: IDENTITY → INTERESTS → EXPERIENCE → TECHNOLOGY → CREATIVE WORK.
 * Words slide in from blur, ghost duplicates parallax behind, and the last
 * plate stretches horizontally into the Experience chapter.
 */
export default function About() {
  const root = useRef<HTMLElement>(null)

  useIsomorphicLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const q = gsap.utils.selector(root.current)
      const plates = q('[data-plate]') as HTMLElement[]
      const barFill = q('[data-about-barfill]')
      const hint = q('[data-about-hint]')
      const reduced = useUI.getState().reducedMotion

      const setBar = gsap.quickSetter(barFill[0], 'scaleX')

      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: root.current,
          start: 'top top',
          end: '+=340%',
          pin: true,
          scrub: true,
          anticipatePin: 1,
          onUpdate: (self) => {
            S.about = self.progress
            setBar(self.progress)
          },
        },
      })

      plates.forEach((el, i) => {
        const chars = el.querySelectorAll('.char')
        const word = el.querySelector('[data-word]')
        const desc = el.querySelector('[data-desc]')
        const kicker = el.querySelector('[data-kicker]')
        const ghost = el.querySelector('[data-ghost]')
        const t = i
        const last = i === plates.length - 1

        tl.fromTo(el, { opacity: 0 }, { opacity: 1, duration: 0.28 }, t + 0.04)
        tl.fromTo(kicker, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.18 }, t + 0.08)

        if (reduced) {
          tl.fromTo(desc, { opacity: 0 }, { opacity: 1, duration: 0.25 }, t + 0.15)
        } else {
          tl.fromTo(
            chars,
            { yPercent: 110, opacity: 0 },
            { yPercent: 0, opacity: 1, stagger: 0.008, duration: 0.34 },
            t + 0.05
          )
          tl.fromTo(
            desc,
            { opacity: 0, y: 26, filter: 'blur(6px)' },
            { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.3 },
            t + 0.18
          )
          tl.fromTo(
            ghost,
            { xPercent: -5, opacity: 0 },
            { xPercent: 5, opacity: 0.07, duration: 0.95 },
            t
          )
        }

        if (!last) {
          if (!reduced) {
            tl.to(chars, { yPercent: -80, opacity: 0, stagger: 0.005, duration: 0.24 }, t + 0.68)
            tl.to(desc, { opacity: 0, y: -20, filter: 'blur(6px)', duration: 0.2 }, t + 0.7)
          }
          tl.to(el, { opacity: 0, duration: 0.24 }, t + 0.73)
        } else {
          /* stretch transition → EXPERIENCE */
          if (!reduced) {
            tl.to(word, { scaleX: 1.75, filter: 'blur(10px)', duration: 0.24, transformOrigin: '50% 50%' }, t + 0.76)
            tl.to(desc, { opacity: 0, y: -20, duration: 0.18 }, t + 0.74)
          }
          tl.to(el, { opacity: 0, duration: 0.2 }, t + 0.8)
        }
      })

      tl.to(hint, { opacity: 0, duration: 0.3 }, plates.length - 0.4)

      ScrollTrigger.create({
        trigger: root.current,
        start: 'top 60%',
        end: 'bottom 40%',
        onToggle: (self) => {
          if (self.isActive) useUI.getState().set({ active: 'about' })
        },
      })
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <section id="about" ref={root} className="vh relative overflow-hidden" aria-label="About">
      <div className="micro absolute left-6 top-6 z-10 flex items-center gap-4 md:left-24 md:top-8">
        <span className="!text-accent-soft">02</span>
        <span>About</span>
        <span className="relative block h-px w-20 overflow-hidden bg-white/15 md:w-28">
          <span
            data-about-barfill
            className="absolute inset-0 origin-left bg-accent"
            style={{ transform: 'scaleX(0)' }}
          />
        </span>
      </div>

      {ABOUT_PLATES.map((p, i) => (
        <div key={i} data-plate className="absolute inset-0 flex items-center justify-center px-6 opacity-0">
          <div
            data-ghost
            className="text-outline pointer-events-none absolute select-none whitespace-nowrap font-display text-[17vw] font-bold opacity-0"
            aria-hidden="true"
          >
            {p.word}
          </div>
          <div className="relative max-w-3xl text-center">
            <p data-kicker className="micro mb-5 !text-accent-soft">
              {p.kicker}
            </p>
            <h2
              data-word
              aria-label={p.word}
              className="font-display text-[clamp(2.6rem,9vw,7.5rem)] font-bold leading-none tracking-tight"
            >
              <Chars text={p.word} />
            </h2>
            <p data-desc className="mx-auto mt-6 max-w-[52ch] text-sm leading-relaxed text-mute md:text-lg">
              {p.desc}
            </p>
          </div>
        </div>
      ))}

      <div data-about-hint className="micro absolute bottom-6 left-1/2 -translate-x-1/2 !text-faint">
        Keep scrolling — identity unfolding
      </div>
    </section>
  )
}
