'use client'

import { useRef } from 'react'
import { gsap, ScrollTrigger } from '@/lib/gsap'
import { S } from '@/lib/scroll-state'
import { useUI } from '@/lib/store'
import { useIsomorphicLayoutEffect } from '@/lib/hooks'
import { PROJECTS } from '@/lib/content'

/**
 * WORK — "SELECTED WORK". A cinematic horizontal gallery of five large
 * stages. Hovering a stage tilts its glass panel and excites the 3D
 * monument behind it; clicking expands into the case-study overlay.
 */
export default function Work() {
  const root = useRef<HTMLElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const countRef = useRef<HTMLSpanElement>(null)

  useIsomorphicLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const track = trackRef.current!
      const dist = () => Math.max(1, track.scrollWidth - window.innerWidth)
      const stages = gsap.utils.toArray<HTMLElement>('[data-stage]', root.current!)
      const reduced = useUI.getState().reducedMotion

      const fracAt = (x: number) => {
        const centers = stages.map((n) => n.offsetLeft + n.offsetWidth / 2 - window.innerWidth / 2)
        if (centers.length === 0) return 0
        let idx = 0
        for (let i = 0; i < centers.length; i++) if (x >= centers[i]) idx = i
        const next = Math.min(idx + 1, centers.length - 1)
        const span = centers[next] - centers[idx]
        const f = span !== 0 ? (x - centers[idx]) / span : 0
        return Math.max(0, Math.min(centers.length - 1, idx + Math.max(0, Math.min(1, f))))
      }

      const setters = stages.map((n) => ({
        opacity: gsap.quickSetter(n, 'opacity'),
        scale: gsap.quickSetter(n, 'scale'),
      }))
      const setBar = gsap.quickSetter(root.current!.querySelector('[data-work-bar]'), 'scaleX')

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
            S.work = self.progress
            const frac = fracAt(self.progress * dist())
            S.workActive = frac
            setBar(self.progress)
            if (countRef.current) {
              countRef.current.textContent = String(Math.round(frac) + 1).padStart(2, '0')
            }
            stages.forEach((_, i) => {
              const d = Math.min(1, Math.abs(i - frac) * 0.85)
              setters[i].opacity(1 - d * 0.45)
              setters[i].scale(1 - d * 0.05)
            })
          },
        },
      })

      if (!reduced) {
        stages.forEach((stage) => {
          gsap.from(stage.querySelectorAll('[data-r]'), {
            y: 80,
            opacity: 0,
            stagger: 0.08,
            duration: 0.7,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: stage,
              containerAnimation: tween,
              start: 'left 80%',
              end: 'left 45%',
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
          if (self.isActive) useUI.getState().set({ active: 'work' })
        },
      })
    }, root)
    return () => ctx.revert()
  }, [])

  /* glass-panel perspective tilt (desktop only) */
  const onPanelMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (S.mobile || S.reducedMotion) return
    const el = e.currentTarget
    const r = el.getBoundingClientRect()
    const rx = ((e.clientY - (r.top + r.height / 2)) / r.height) * -6
    const ry = ((e.clientX - (r.left + r.width / 2)) / r.width) * 8
    gsap.to(el, { rotationX: rx, rotationY: ry, duration: 0.6, ease: 'power2.out', transformPerspective: 900 })
  }
  const onPanelLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    gsap.to(e.currentTarget, { rotationX: 0, rotationY: 0, duration: 0.9, ease: 'power3.out', transformPerspective: 900 })
  }

  const openDetail = (i: number) => useUI.getState().set({ detail: i })

  return (
    <section id="work" ref={root} className="vh relative overflow-hidden" aria-label="Selected work">
      <div className="micro absolute left-6 top-6 z-10 flex items-center gap-4 md:left-24 md:top-8">
        <span className="!text-accent-soft">05</span>
        <span>Work</span>
        <span className="relative block h-px w-16 overflow-hidden bg-white/15 md:w-24">
          <span data-work-bar className="absolute inset-0 origin-left bg-accent" style={{ transform: 'scaleX(0)' }} />
        </span>
        <span>
          <span ref={countRef}>01</span>
          <span className="!text-faint"> / 05</span>
        </span>
      </div>

      <div ref={trackRef} className="flex h-full w-max items-center pl-[6vw] pr-[8vw]">
        {/* lead-in */}
        <div className="w-[80vw] shrink-0 pr-[10vw] md:w-[42vw]">
          <p className="micro mb-6 !text-accent-soft">What I have done</p>
          <h2 className="font-display text-[clamp(2.6rem,8vw,7.2rem)] font-bold leading-[0.92] tracking-tight">
            SELECTED
            <br />
            WORK
          </h2>
          <p className="mt-6 max-w-[38ch] text-sm leading-relaxed text-mute md:text-base">
            Five builds where intelligence met interface. Click any project to open its case study.
          </p>
          <p className="micro mt-10 !text-faint">The gallery travels →</p>
        </div>

        {PROJECTS.map((p, i) => (
          <article
            key={p.id}
            data-stage={i}
            data-cursor="view"
            className="relative mr-[8vw] flex h-full w-[86vw] shrink-0 items-center md:w-[74vw]"
            onClick={() => openDetail(i)}
            onPointerEnter={() => (S.hoverProject = i)}
            onPointerLeave={() => (S.hoverProject = null)}
          >
            <span
              data-r
              aria-hidden="true"
              className="text-outline pointer-events-none absolute -top-[1vw] left-0 select-none font-display text-[clamp(5rem,17vw,14rem)] font-bold leading-none opacity-70"
            >
              {p.index}
            </span>

            <div className="grid w-full items-end gap-8 md:grid-cols-[1.15fr_0.85fr] md:gap-10">
              <div className="relative">
                <p data-r className="micro mb-4 !text-accent-soft">
                  {p.category} — {p.year}
                </p>
                <h3 data-r className="font-display text-[clamp(2.4rem,6.5vw,6rem)] font-bold leading-[0.95] tracking-tight">
                  {p.name}
                </h3>
                <p data-r className="mt-5 max-w-[44ch] text-sm leading-relaxed text-mute md:text-base">
                  {p.description}
                </p>
                <button
                  data-r
                  type="button"
                  data-cursor="view"
                  className="neu micro mt-8 rounded-full !text-ink md:px-7 px-5 py-3"
                  onClick={(e) => {
                    e.stopPropagation()
                    openDetail(i)
                  }}
                >
                  View case study <span className="!text-accent-soft">— 0{i + 1}</span>
                </button>
              </div>

              <div
                data-r
                className="glass hidden rounded-2xl p-6 md:block md:p-7"
                onMouseMove={onPanelMove}
                onMouseLeave={onPanelLeave}
              >
                <p className="micro mb-4 !text-faint">Stack</p>
                <div className="flex flex-wrap gap-2">
                  {p.tech.map((t) => (
                    <span
                      key={t}
                      className="micro rounded-full border border-white/10 px-3 py-1.5 !text-[9px] !tracking-[0.14em] !text-mute"
                    >
                      {t}
                    </span>
                  ))}
                </div>
                <div className="my-5 h-px bg-white/10" />
                <dl className="grid grid-cols-2 gap-4">
                  <div>
                    <dt className="micro mb-1.5 !text-faint">Role</dt>
                    <dd className="text-sm text-ink/90">{p.role}</dd>
                  </div>
                  <div>
                    <dt className="micro mb-1.5 !text-faint">Year</dt>
                    <dd className="text-sm text-ink/90">{p.year}</dd>
                  </div>
                </dl>
              </div>
            </div>
          </article>
        ))}

        <div className="w-[20vw] shrink-0" aria-hidden="true" />
      </div>
    </section>
  )
}
