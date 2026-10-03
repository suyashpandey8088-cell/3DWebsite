/**
 * SCROLL STATE — a mutable, per-frame store shared between the DOM scroll
 * system (GSAP ScrollTrigger) and the WebGL scene (react-three-fiber).
 *
 * Written to every frame by ScrollTrigger callbacks, read every frame by
 * useFrame() — deliberately NOT React state, so nothing re-renders.
 */

export interface ScrollState {
  /** 0..1 across the entire journey */
  progress: number
  /** scroll velocity (px/frame-ish, signed) */
  velocity: number
  /** 1 down, -1 up */
  direction: number

  pointer: { x: number; y: number }
  pointerSmooth: { x: number; y: number }

  /* per-section pin progress (0..1) — sections are sequential, so the sum
     of these acts as a continuous "journey coordinate" from 0 to 7 */
  hero: number
  about: number
  xp: number
  skills: number
  work: number
  contact: number
  end: number

  /** fractional active node while traveling the experience timeline */
  xpActive: number
  /** fractional active project while traveling the work gallery */
  workActive: number

  /** 0..1 while a project case-study overlay is open */
  detailOpen: number
  /** index of hovered project stage, or null */
  hoverProject: number | null

  /** 0..1 hero-core entry animation (driven by the preloader exit) */
  coreIntro: number

  reducedMotion: boolean
  mobile: boolean
}

export const S: ScrollState = {
  progress: 0,
  velocity: 0,
  direction: 1,
  pointer: { x: 0, y: 0 },
  pointerSmooth: { x: 0, y: 0 },
  hero: 0,
  about: 0,
  xp: 0,
  skills: 0,
  work: 0,
  contact: 0,
  end: 0,
  xpActive: 0,
  workActive: 0,
  detailOpen: 0,
  hoverProject: null,
  coreIntro: 0,
  reducedMotion: false,
  mobile: false,
}

/** Continuous journey coordinate: 0 hero → 1 about → 2 experience → 3 skills → 4 work → 5 contact → 6 end */
export const journey = () =>
  Math.min(7, Math.max(0, S.hero + S.about + S.xp + S.skills + S.work + S.contact + S.end))
