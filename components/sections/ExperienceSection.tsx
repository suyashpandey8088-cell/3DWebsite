'use client'

import { useRef } from 'react'
import { gsap, ScrollTrigger } from '@/lib/gsap'
import { S } from '@/lib/scroll-state'
import { useUI } from '@/lib/store'
import { useIsomorphicLayoutEffect } from '@/lib/hooks'
import { EXPERIENCES } from '@/lib/content'

/**
 * EXPERIENCE — a horizontal timeline driven by vertical scroll. Five nodes
 * travel sideways; each node scales/fades by distance from the viewport
 * center (depth), and per-node reveals ride the container animation.
 */
export default function ExperienceSection() {
  const root = useRef<HTMLElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const countRef = useRef<HTMLSpanElement>(null)

  useIsomorphicLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const track = trackRef.current!
      const dist = () => Math.max(1, track.scrollWidth - window.innerWidth)
      const nodes = gsap.utils.toArray<HTMLElement>('[data-node]', root.current!)
      const reduced = useUI.getState().reducedMotion

      /* fractional index of the node currently centered in the viewport */
      const fracAt = (x: number) => {
        const centers = nodes.map((n) => n.offsetLeft + n.offsetWidth / 2 - window.innerWidth / 2)
        if (centers.length === 0) return 0
        let idx = 0
        for (let i = 0; i < centers.length; i++) if (x >= centers[i]) idx = i
        const next = Math.min(idx + 1, centers.length - 1)
        const span = centers[next] - centers[idx]
        const f = span !== 0 ? (x - centers[idx]) / span : 0
        return Math.max(0, Math.min(centers.length - 1, idx + Math.max(0, Math.min(1, f))))
      }

      const setters = nodes.map((n) => ({
        opacity: gsap.quickSetter(n, 'opacity'),
        scale: gsap.quickSetter(n, 'scale'),
        y: gsap.quickSetter(n, 'y'),
      }))

      const setBar = gsap.quickSetter(root.current!.querySelector('[data-xp-bar]'), 'scaleX')
      let lastIdx = -1

      const tween = gsap.to(track, {
        x: () => -dist(),
        ease: 'none',
        scrollTrigger: {
          trigger: root.current,
          start: 'top top',
          end: () => '+=' + dist(),
          pin: true,
          scrub: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            S.xp = self.progress
            const frac = fracAt(self.progress * dist())
            S.xpActive = frac
            setBar(self.progress)
            if (countRef.current) {
              countRef.current.textContent = String(
                Math.min(EXPERIENCES.length, Math.round(frac) + 1)
              ).padStart(2, '0')
            }
            nodes.forEach((_, i) => {
              const d = Math.min(1, Math.abs(i - frac) * 0.9)
              setters[i].opacity(1 - d * 0.6)
              setters[i].scale(1 - d * 0.08)
              setters[i].y(reduced ? 0 : -d * 26)
            })
            const idx = Math.round(frac)
            if (idx !== lastIdx) {
              lastIdx = idx
              useUI.getState().set({ xpIndex: idx })
            }
          },
        },
      })

      /* per-node entrance, scrubbed against the horizontal motion */
      if (!reduced) {
        nodes.forEach((node) => {
          gsap.from(node.querySelectorAll('[data-r]'), {
            y: 70,
            opacity: 0,
            stagger: 0.07,
            duration: 0.6,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: node,
              containerAnimation: tween,
              start: 'left 78%',
              end: 'left 35%',
              scrub: true,
            },
          })
        })
      }

      ScrollTrigger.create({
        trigger: root.current,
        start: 'top 55%',
        end: 'bottom 45%',
        onToggle: (self) => {
          if (self.isActive) useUI.getState().set({ active: 'experience' })
        },
      })
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <section id="experience" ref={root} className="vh relative overflow-hidden" aria-label="Experience">
      <div className="micro absolute left-6 top-6 z-10 flex items-center gap-4 md:left-24 md:top-8">
        <span className="!text-accent-soft">03</span>
        <span>Experience</span>
        <span className="relative block h-px w-16 overflow-hidden bg-white/15 md:w-24">
          <span data-xp-bar className="absolute inset-0 origin-left bg-accent" style={{ transform: 'scaleX(0)' }} />
        </span>
        <span>
          <span ref={countRef}>01</span>
          <span className="!text-faint"> / 05</span>
        </span>
      </div>

      <div ref={trackRef} className="flex h-full w-max items-center pl-[7vw] pr-[10vw]">
        {/* lead-in */}
        <div className="w-[72vw] shrink-0 pr-[10vw] md:w-[40vw]">
          <p className="micro mb-6 !text-accent-soft">Five chapters, one road</p>
          <h2 className="font-display text-[clamp(2.2rem,6.5vw,5.8rem)] font-bold leading-[0.95] tracking-tight">
            EXPERIENCE
          </h2>
          <p className="mt-6 max-w-[36ch] text-sm leading-relaxed text-mute md:text-base">
            Five stops on the road — from data desks to solution architecture. Keep scrolling to
            travel the timeline sideways.
          </p>
          <p className="micro mt-10 !text-faint">Scroll — the timeline travels →</p>
        </div>

        {EXPERIENCES.map((x) => (
          <article
            key={x.index}
            data-node
            className="mr-[7vw] w-[82vw] shrink-0 md:mr-[4vw] md:w-[64vw]"
          >
            <div className="grid items-center gap-8 md:grid-cols-[1.15fr_1fr] md:gap-12">
              <div className="relative">
                <span
                  data-r
                  className="text-outline block select-none font-display text-[clamp(4rem,13vw,10rem)] font-bold leading-none"
                  aria-hidden="true"
                >
                  {x.index}
                </span>
                <h3 data-r className="mt-3 font-display text-[clamp(1.7rem,4vw,3.4rem)] font-bold leading-tight tracking-tight">
                  {x.role}
                </h3>
                <p data-r className="micro mt-4 !text-accent-soft">
                  {x.company} — {x.duration}
                </p>
              </div>

              <div data-r className="glass rounded-2xl p-6 md:p-7">
                <p className="micro mb-3 !text-faint">Key responsibilities</p>
                <ul className="space-y-2.5 text-[13px] leading-relaxed text-mute md:text-sm">
                  {x.responsibilities.map((r, ri) => (
                    <li key={ri} className="flex gap-3">
                      <span className="mt-[2px] shrink-0 text-accent">—</span>
                      {r}
                    </li>
                  ))}
                </ul>
                <div className="my-5 h-px bg-white/10" />
                <p className="micro mb-3 !text-faint">Key learnings</p>
                <ul className="space-y-2.5 text-[13px] leading-relaxed text-ink/90 md:text-sm">
                  {x.learnings.map((l, li) => (
                    <li key={li} className="flex gap-3">
                      <span className="mt-[2px] shrink-0 text-accent-soft">◆</span>
                      {l}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </article>
        ))}

        <div className="w-[26vw] shrink-0" aria-hidden="true" />
      </div>

      <div className="micro absolute bottom-6 right-6 hidden items-center gap-3 !text-faint md:flex">
        Vertical scroll → horizontal travel
      </div>
    </section>
  )
}
