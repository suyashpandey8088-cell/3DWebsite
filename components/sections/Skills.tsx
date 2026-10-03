'use client'

import { useEffect, useRef, useState } from 'react'
import { gsap, ScrollTrigger } from '@/lib/gsap'
import { S } from '@/lib/scroll-state'
import { useUI } from '@/lib/store'
import { useIsomorphicLayoutEffect } from '@/lib/hooks'
import { SKILLS } from '@/lib/content'
import { smoothstep } from '@/lib/utils'

/**
 * SKILLS — "MY STACK" as a radial constellation. Scroll rotates the orbit,
 * hover/focus brings a node forward and dims the rest, the hub describes
 * the focused technology. Leaving the section scatters the nodes outward.
 */
export default function Skills() {
  const root = useRef<HTMLElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)
  const nodesRef = useRef<Array<HTMLButtonElement | null>>([])
  const lineRef = useRef<SVGLineElement>(null)
  const hubRef = useRef<HTMLDivElement>(null)
  const orbitsRef = useRef<HTMLDivElement>(null)
  const hintRef = useRef<HTMLDivElement>(null)
  const [radius, setRadius] = useState(280)

  const hoverSkill = useUI((s) => s.hoverSkill)
  const selectedSkill = useUI((s) => s.selectedSkill)
  const active = hoverSkill ?? selectedSkill

  /* keep a ref so the ticker always reads the live radius without re-creating triggers */
  const radiusRef = useRef(radius)
  radiusRef.current = radius

  /* responsive orbit radius */
  useEffect(() => {
    const measure = () => {
      const m = Math.min(window.innerWidth, window.innerHeight)
      setRadius(m * (window.innerWidth < 768 ? 0.4 : 0.33))
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [])

  /* place nodes on the circle (deterministic, hydration-safe) */
  useEffect(() => {
    SKILLS.forEach((_, i) => {
      const n = nodesRef.current[i]
      if (!n) return
      const a = (i / SKILLS.length) * Math.PI * 2 - Math.PI / 2
      n.style.transform = `translate(${Math.cos(a) * radius}px, ${Math.sin(a) * radius}px)`
    })
    if (lineRef.current) {
      lineRef.current.setAttribute('x2', '0')
      lineRef.current.setAttribute('y2', `${-radius}`)
    }
  }, [radius])

  useIsomorphicLayoutEffect(() => {
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: root.current,
        start: 'top top',
        end: '+=240%',
        pin: true,
        anticipatePin: 1,
        onUpdate: (self) => {
          S.skills = self.progress
        },
      })
      ScrollTrigger.create({
        trigger: root.current,
        start: 'top 55%',
        end: 'bottom 45%',
        onToggle: (self) => {
          if (self.isActive) useUI.getState().set({ active: 'skills' })
        },
      })
    }, root)

    /* rotation loop: scrub + slow idle drift.
       Hovering pauses the orbit for stable inspection; selecting (click)
       steers that node to the top and holds it there, even mid-scroll. */
    let rot = 0
    let idle = 0
    let lastActive: number | null = null
    const TWO_PI = Math.PI * 2
    const tick = (_t: number, dtMs: number) => {
      const dt = dtMs / 1000
      const radius = radiusRef.current
      const ui = useUI.getState()
      const hoverIdx = ui.hoverSkill
      const selectedIdx = ui.selectedSkill
      const activeIdx = hoverIdx ?? selectedIdx

      if (selectedIdx != null) {
        const base = (selectedIdx / SKILLS.length) * TWO_PI - Math.PI / 2
        let want = -Math.PI / 2 - base - S.skills * Math.PI * 1.35
        want += Math.round((idle - want) / TWO_PI) * TWO_PI
        idle += (want - idle) * Math.min(1, dt * 5)
      } else if (activeIdx == null && !S.reducedMotion) {
        idle += dt * 0.045
      }

      const target = S.skills * Math.PI * 1.35 + idle
      rot += (target - rot) * Math.min(1, dt * 6)

      const scatter = smoothstep(0.8, 1, S.skills)
      const enter = smoothstep(0, 0.05, S.skills)
      const fade = (1 - scatter) * enter
      const scale = (0.82 + 0.18 * enter) * (1 + scatter * 1.7)

      if (ringRef.current) {
        ringRef.current.style.transform = `rotate(${rot}rad) scale(${scale})`
        ringRef.current.style.opacity = `${fade}`
      }
      nodesRef.current.forEach((n) => {
        if (!n) return
        const inner = n.firstElementChild as HTMLElement | null
        if (inner) inner.style.transform = `rotate(${-rot}rad)`
        const fadeEl = n.querySelector<HTMLElement>('.node-fade')
        if (fadeEl) fadeEl.style.opacity = `${fade}`
      })
      if (hubRef.current) hubRef.current.style.opacity = `${fade}`
      if (orbitsRef.current) orbitsRef.current.style.opacity = `${0.6 * fade}`
      if (hintRef.current) hintRef.current.style.opacity = `${fade}`

      /* accent line from hub to the active node */
      const line = lineRef.current
      if (line) {
        if (activeIdx !== null && fade > 0.05) {
          lastActive = activeIdx
          const ang = (activeIdx / SKILLS.length) * TWO_PI - Math.PI / 2 + rot
          line.setAttribute('x2', `${Math.cos(ang) * radius}`)
          line.setAttribute('y2', `${Math.sin(ang) * radius}`)
          line.style.opacity = '0.5'
        } else {
          lastActive = null
          line.style.opacity = '0'
        }
      }
    }
    gsap.ticker.add(tick)

    return () => {
      ctx.revert()
      gsap.ticker.remove(tick)
    }
  }, [])

  const select = (i: number) => {
    const { selectedSkill: sel, set } = useUI.getState()
    set({ selectedSkill: sel === i ? null : i })
  }

  return (
    <section id="skills" ref={root} className="vh relative overflow-hidden" aria-label="Skills">
      <div className="micro absolute left-6 top-6 z-10 flex items-center gap-4 md:left-24 md:top-8">
        <span className="!text-accent-soft">04</span>
        <span>Skills</span>
      </div>

      {/* orbit guides */}
      <div ref={orbitsRef} className="pointer-events-none absolute left-1/2 top-1/2" aria-hidden="true">
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.05]" style={{ width: radius * 1.28, height: radius * 1.28 }} />
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.07]" style={{ width: radius * 1.64, height: radius * 1.64 }} />
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-accent/15" style={{ width: radius * 2, height: radius * 2 }} />
      </div>

      {/* accent line */}
      <svg className="pointer-events-none absolute left-1/2 top-1/2 h-0 w-0 overflow-visible" aria-hidden="true">
        <line
          ref={lineRef}
          x1="0"
          y1="0"
          x2="0"
          y2="-200"
          stroke="var(--color-accent)"
          strokeWidth="1"
          strokeDasharray="4 6"
          opacity="0"
          className="skill-line"
        />
      </svg>

      {/* rotating constellation */}
      <div
        ref={ringRef}
        data-dim={active !== null ? 'true' : 'false'}
        className="skill-ring absolute left-1/2 top-1/2 h-0 w-0 will-change-transform"
      >
        {SKILLS.map((s, i) => (
          <button
            key={s.label}
            ref={(el) => {
              nodesRef.current[i] = el
            }}
            type="button"
            className={`skill-node absolute left-0 top-0 will-change-transform ${active === i ? 'is-active' : ''}`}
            aria-pressed={selectedSkill === i}
            onPointerEnter={() => useUI.getState().set({ hoverSkill: i })}
            onPointerLeave={() => useUI.getState().set({ hoverSkill: null })}
            onFocus={() => useUI.getState().set({ hoverSkill: i })}
            onBlur={() => useUI.getState().set({ hoverSkill: null })}
            onClick={() => select(i)}
          >
            <span className="node-fade block">
              <span className="node-inner block">
                <span className="node-visual glass flex items-center gap-2.5 rounded-full px-3.5 py-2 md:px-4">
                  <span className="dot" aria-hidden="true" />
                  <span className="micro !text-[9px] !tracking-[0.18em] !text-ink/90">{s.label}</span>
                </span>
              </span>
            </span>
          </button>
        ))}
      </div>

      {/* hub */}
      <div
        ref={hubRef}
        className="glass absolute left-1/2 top-1/2 flex h-[168px] w-[168px] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full p-6 text-center md:h-[224px] md:w-[224px]"
      >
        <p className="micro !text-[8px] !text-faint">{active !== null ? 'Stack node' : 'My stack'}</p>
        <p key={`n-${active ?? 'none'}`} className="hub-swap mt-2 font-display text-lg font-bold leading-tight md:text-2xl">
          {active !== null ? SKILLS[active].label : 'MY STACK'}
        </p>
        <p key={`d-${active ?? 'none'}`} className="hub-swap mt-3 hidden text-[11px] leading-relaxed text-mute md:block md:text-xs">
          {active !== null
            ? SKILLS[active].blurb
            : 'Scroll to rotate the orbit. Hover a node to inspect it.'}
        </p>
        {active !== null && (
          <p key={`m-${active}`} className="hub-swap mt-3 text-[10px] leading-relaxed text-mute md:hidden">
            {SKILLS[active].blurb}
          </p>
        )}
      </div>

      <div ref={hintRef} className="micro absolute bottom-6 left-1/2 -translate-x-1/2 !text-faint">
        Scroll to rotate — hover to inspect
      </div>
    </section>
  )
}
