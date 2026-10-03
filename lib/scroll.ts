import { getLenis } from './lenis'
import { useUI, type SectionId } from './store'

const easeOutQuart = (t: number) => 1 - Math.pow(1 - t, 4)

export function scrollToSection(id: SectionId) {
  const el = document.getElementById(id)
  if (!el) return
  const lenis = getLenis()
  const reduced = useUI.getState().reducedMotion
  if (lenis) lenis.scrollTo(el, { duration: 1.8, easing: easeOutQuart })
  else el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' })
}

export function backToTop() {
  const lenis = getLenis()
  const reduced = useUI.getState().reducedMotion
  if (lenis) lenis.scrollTo(0, { duration: 3.2, easing: (t: number) => 1 - Math.pow(1 - t, 5) })
  else window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' })
}
