'use client'

import { useRef } from 'react'
import { gsap, ScrollTrigger } from '@/lib/gsap'
import { S } from '@/lib/scroll-state'
import { useUI } from '@/lib/store'
import { useIsomorphicLayoutEffect } from '@/lib/hooks'
import { Chars } from '@/components/ui/Chars'
import { CONTACTS } from '@/lib/content'

/**
 * CONTACT — the final scene's opening act. Big type, four oversized links
 * that shift, sweep and glow on hover while the final 3D form assembles
 * in the canvas behind.
 */
export default function Contact() {
  const root = useRef<HTMLElement>(null)

  useIsomorphicLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const q = gsap.utils.selector(root.current)
      const reduced = useUI.getState().reducedMotion
      const chars = q('[data-cline] .char')
      const sub = q('[data-csub]')
      const links = q('[data-clink]')
      const avail = q('[data-cavail]')

      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: root.current,
          start: 'top top',
          end: '+=150%',
          pin: true,
          scrub: true,
          anticipatePin: 1,
          onUpdate: (self) => {
            S.contact = self.progress
          },
        },
      })

      if (reduced) {
        tl.fromTo(chars, { opacity: 0 }, { opacity: 1, stagger: 0.01, duration: 0.4 }, 0)
          .fromTo(sub, { opacity: 0 }, { opacity: 1, duration: 0.2 }, 0.25)
          .fromTo(links, { opacity: 0 }, { opacity: 1, stagger: 0.04, duration: 0.25 }, 0.3)
          .fromTo(avail, { opacity: 0 }, { opacity: 1, duration: 0.2 }, 0.45)
      } else {
        tl.fromTo(chars, { yPercent: 120 }, { yPercent: 0, stagger: 0.012, duration: 0.35 }, 0)
          .fromTo(sub, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.25 }, 0.22)
          .fromTo(
            links,
            { opacity: 0, x: -56 },
            { opacity: 1, x: 0, stagger: 0.035, duration: 0.3, ease: 'power2.out' },
            0.28
          )
          .fromTo(avail, { opacity: 0 }, { opacity: 1, duration: 0.2 }, 0.45)
          /* gentle drift as the scene hands off to the finale */
          .to(q('[data-cwrap]'), { y: -50, opacity: 0.35, duration: 0.2 }, 0.8)
      }

      ScrollTrigger.create({
        trigger: root.current,
        start: 'top 55%',
        end: 'bottom 45%',
        onToggle: (self) => {
          if (self.isActive) useUI.getState().set({ active: 'contact' })
        },
      })
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <section id="contact" ref={root} className="vh relative overflow-hidden" aria-label="Contact">
      <div className="micro absolute left-6 top-6 z-10 flex items-center gap-4 md:left-24 md:top-8">
        <span className="!text-accent-soft">06</span>
        <span>Contact</span>
      </div>

      <div data-cwrap className="flex h-full flex-col justify-center px-6 md:px-24">
        <h2
          aria-label="Let's build something."
          className="font-display text-[clamp(2.7rem,9vw,8rem)] font-bold leading-[0.95] tracking-tight"
        >
          <span className="line-mask">
            <span data-cline="1" className="line">
              <Chars text="LET'S BUILD" />
            </span>
          </span>
          <span className="line-mask">
            <span data-cline="2" className="line text-outline">
              <Chars text="SOMETHING." />
            </span>
          </span>
        </h2>

        <p data-csub className="mt-6 max-w-[40ch] text-sm text-mute md:text-lg">
          Have an idea, project, opportunity, or experiment?
        </p>

        <ul data-clinks className="mt-10 border-y border-white/10 md:mt-14">
          {CONTACTS.map((c, i) => (
            <li key={c.label}>
              <a
                data-clink
                data-cursor="open"
                href={c.href}
                target={c.external ? '_blank' : undefined}
                rel={c.external ? 'noreferrer' : undefined}
                className="group relative flex items-center justify-between overflow-hidden py-4 md:py-5"
              >
                <span className="absolute inset-0 bg-accent/0 transition-colors duration-500 group-hover:bg-accent/[0.07]" />
                <span className="link-sweep" aria-hidden="true" />
                <span className="relative flex items-baseline gap-4 md:gap-6">
                  <span className="micro !text-faint">0{i + 1}</span>
                  <span className="font-display text-xl font-semibold tracking-tight transition-transform duration-500 ease-out group-hover:translate-x-3 md:text-4xl">
                    {c.label}
                  </span>
                </span>
                <span className="relative flex items-center gap-4">
                  <span className="micro hidden !tracking-[0.1em] !text-faint md:block">{c.handle}</span>
                  <span
                    className="-translate-x-2 text-accent-soft opacity-0 transition-all duration-500 group-hover:translate-x-0 group-hover:opacity-100"
                    aria-hidden="true"
                  >
                    ↗
                  </span>
                </span>
              </a>
            </li>
          ))}
        </ul>

        <p data-cavail className="micro mt-8">
          Status — <span className="!text-accent-soft">open to opportunities · 2026</span>
        </p>
      </div>
    </section>
  )
}
