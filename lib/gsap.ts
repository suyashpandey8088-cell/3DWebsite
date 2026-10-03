import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
  ScrollTrigger.config({ ignoreMobileResize: true })
  // exposed for the e2e screenshot script / debugging
  ;(window as unknown as Record<string, unknown>).__st = ScrollTrigger
}

export { gsap, ScrollTrigger }
