import { useEffect, useLayoutEffect, useState } from 'react'
import { useUI } from './store'
import { S } from './scroll-state'

export const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect

export function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const apply = () => {
      setReduced(mq.matches)
      useUI.getState().set({ reducedMotion: mq.matches })
      S.reducedMotion = mq.matches
    }
    apply()
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [])
  return reduced
}

export function useIsMobile() {
  const [m, setM] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px), (pointer: coarse)')
    const apply = () => {
      setM(mq.matches)
      useUI.getState().set({ isMobile: mq.matches })
      S.mobile = mq.matches
    }
    apply()
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [])
  return m
}
