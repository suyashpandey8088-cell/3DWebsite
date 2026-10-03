# SUYASH PANDEY — An Immersive 3D Experimental Portfolio

> **The portfolio is an experience, not a webpage.**

A scroll-driven digital world: a persistent WebGL universe behind seven
DOM chapters — hero core → identity plates → horizontal experience timeline →
radial skills constellation → cinematic project gallery → contact scene →
the final form. One continuous camera journey, fully reversible by scrolling.

## Stack

- **Next.js 15 (App Router) + TypeScript**
- **Tailwind CSS v4** — design tokens, glass/neumorphic surfaces
- **GSAP + ScrollTrigger** — pinning, horizontal travel, scrubbed timelines
- **Lenis** — momentum smooth-scrolling on one shared clock
- **Three.js + React Three Fiber + Drei** — the 3D universe (procedural
  environment, no network assets)

## Run

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
npm run start
```

## Architecture

```
lib/
  content.ts        ← ALL text/data. Edit this file to make it yours.
  scroll-state.ts   ← per-frame mutable state shared DOM ⇄ WebGL (no re-renders)
  store.ts          ← discrete UI state (active section, menu, sound…)
  gsap.ts           ← plugin registration
  sound.ts          ← WebAudio ambient engine (muted by default)
components/
  experience/       ← root, preloader, cursor, navigation, smooth scroll,
                      background FX, scene canvas, project detail overlay
  three/            ← camera rig, hero core, particle field, per-section
                      3D artifacts, final form
  sections/         ← hero, about, experience, skills, work, contact, finale
  ui/               ← Chars (split text), Magnetic (magnetic buttons)
```

### How scroll drives the world

Each chapter pins and writes its normalized progress into a mutable
`S` state object. The sum of those progresses forms a continuous
"journey coordinate" (0 → 7) that the WebGL camera rig and every 3D
artifact sample each frame. Everything is scrubbed, so scrolling up
reverses the entire experience.

## Customizing content

Everything lives in `lib/content.ts` — profile links, the five experience
nodes (companies/durations are placeholders marked `← EDIT`), the 12 skill
nodes with blurbs, and five projects each with a full case study
(overview / problem / solution / technology / contribution / result /
learnings).

The accent color is a single token — `--color-accent` in `app/globals.css`.

## Accessibility & performance

- Semantic landmarks, keyboard-navigable (rail nav, skills nodes are real
  buttons, case study is a focus-trapped dialog with Esc support)
- `prefers-reduced-motion` disables smooth-scroll, character stagger,
  parallax, cursor effects and idle 3D motion
- Custom cursor and heavy effects limited to fine-pointer devices
- Adaptive DPR via drei `PerformanceMonitor`; DOM animation limited to
  transform / opacity / filter; per-frame state kept out of React

## Test harness

With Chromium installed (`npm i --no-save playwright && npx playwright install chromium`):

```bash
node scripts/shots.mjs        # walks the whole journey, screenshots every chapter
                              # (desktop + mobile + reduced-motion), reports console errors
node scripts/analyze.mjs      # per-screenshot pixel statistics (blank-scene detection)
node scripts/probe.mjs        # DOM probes: pins, plates, ring, overlay, focus handling
node scripts/interactions.mjs # menu, sound toggle, skills hover/select, nav jumps
node scripts/canvas-diff.mjs  # proves the WebGL scene contributes pixels per chapter
```

Note: dev mode uses Turbopack (`next dev --turbopack`) — fast and light.
The production build is also Turbopack-based on constrained machines.
