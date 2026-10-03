import { create } from 'zustand'

export type SectionId = 'intro' | 'about' | 'experience' | 'skills' | 'work' | 'contact'

export interface UIState {
  /** first WebGL frame rendered */
  canvasReady: boolean
  /** preloader finished — hero intro plays */
  ready: boolean
  active: SectionId
  menuOpen: boolean
  hoverSkill: number | null
  selectedSkill: number | null
  /** open project case-study index, or null */
  detail: number | null
  sound: boolean
  reducedMotion: boolean
  isMobile: boolean
  /** discrete active experience node (0..4) */
  xpIndex: number
  set: (partial: Partial<UIState>) => void
}

export const useUI = create<UIState>()((set) => ({
  canvasReady: false,
  ready: false,
  active: 'intro',
  menuOpen: false,
  hoverSkill: null,
  selectedSkill: null,
  detail: null,
  sound: false,
  reducedMotion: false,
  isMobile: false,
  xpIndex: 0,
  set: (partial) => set(partial),
}))

export const SECTIONS: Array<{ id: SectionId; label: string }> = [
  { id: 'intro', label: 'Intro' },
  { id: 'about', label: 'About' },
  { id: 'experience', label: 'Experience' },
  { id: 'skills', label: 'Skills' },
  { id: 'work', label: 'Work' },
  { id: 'contact', label: 'Contact' },
]
