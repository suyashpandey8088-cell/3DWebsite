'use client'

import { useRef } from 'react'
import { gsap, ScrollTrigger } from '@/lib/gsap'
import { S } from '@/lib/scroll-state'
import { useUI } from '@/lib/store'
import { useIsomorphicLayoutEffect } from '@/lib/hooks'
import { Chars } from '@/components/ui/Chars'
import { Magnetic } from '@/components/ui/Magnetic'
import { backToTop } from '@/lib/scroll'

/**
 * FINAL SCENE — the end of the world. The torus knot takes center stage,
 * "THANKS FOR EXPLORING" rises, and BACK TO TOP reverses the entire
 * journey in one continuous ride.
 */
export default function FinalScene() {
  const root = useRef<HTMLElement>(null)

  useIsomorphicLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const q = gsap.utils.selector(root.current)
      const reduced = useUI.getState().reducedMotion
      const chars = q('[data-fline] .char')
      const btn = q('[data-fbtn]')
      const foot = q('[data-ffoot]')

      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: root.current,
          start: 'top top',
          end: '+=90%',
          pin: true,
          scrub: true,
          anticipatePin: 1,
          onUpdate: (self) => {
            S.end = self.progress
          },
        },
      })

      if (reduced) {
        tl.fromTo(chars, { opacity: 0 }, { opacity: 1, stagger: 0.012, duration: 0.4 }, 0)
          .fromTo([btn, foot], { opacity: 0 }, { opacity: 1, duration: 0.2, stagger: 0.06 }, 0.4)
      } else {
        tl.fromTo(chars, { yPercent: 120 }, { yPercent: 0, stagger: 0.014, duration: 0.4 }, 0)
          .fromTo(btn, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.25 }, 0.35)
          .fromTo(foot, { opacity: 0 }, { opacity: 1, duration: 0.2 }, 0.5)
          .fromTo(q('[data-fwrap]'), { scale: 0.97 }, { scale: 1, duration: 0.6 }, 0)
      }
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <section id="end" ref={root} className="vh relative flex items-center justify-center overflow-hidden" aria-label="Finale">
      <div data-fwrap className="px-6 text-center">
        <p className="micro mb-6 !text-faint">You reached the end of the world</p>
        <h2
          aria-label="Thanks for exploring."
          className="font-display text-[clamp(2.4rem,8vw,7rem)] font-bold leading-[0.95] tracking-tight"
        >
          <span className="line-mask">
            <span data-fline="1" className="line">
              <Chars text="THANKS FOR" />
            </span>
          </span>
          <span className="line-mask">
            <span data-fline="2" className="line text-outline">
              <Chars text="EXPLORING." />
            </span>
          </span>
        </h2>

        <div data-fbtn className="mt-12">
          <Magnetic strength={0.4}>
            <button
              type="button"
              onClick={backToTop}
              className="neu micro rounded-full px-8 py-4 !text-ink"
            >
              Back to top <span className="ml-2 !text-accent-soft">↑</span>
            </button>
          </Magnetic>
        </div>

        <p data-ffoot className="micro mt-14 !text-faint">
          Designed &amp; engineered by Suyash Pandey — 2026 · Pune, India
        </p>
      </div>
    </section>
  )
}
