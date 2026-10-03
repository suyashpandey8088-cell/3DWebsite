'use client'

import dynamic from 'next/dynamic'
import Preloader from './Preloader'
import SmoothScroll from './SmoothScroll'
import BackgroundFX from './BackgroundFX'
import CustomCursor from './CustomCursor'
import Navigation from './Navigation'
import ProjectDetail from './ProjectDetail'
import Hero from '@/components/sections/Hero'
import About from '@/components/sections/About'
import ExperienceSection from '@/components/sections/ExperienceSection'
import Skills from '@/components/sections/Skills'
import Work from '@/components/sections/Work'
import Contact from '@/components/sections/Contact'
import FinalScene from '@/components/sections/FinalScene'
import { usePrefersReducedMotion, useIsMobile } from '@/lib/hooks'

const SceneCanvas = dynamic(() => import('./SceneCanvas'), { ssr: false })

/**
 * ExperienceRoot — assembles the world:
 * preloader → persistent WebGL universe → scroll-bound DOM chapters.
 */
export default function ExperienceRoot() {
  usePrefersReducedMotion()
  useIsMobile()

  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>

      <Preloader />

      <SmoothScroll>
        <BackgroundFX />
        <SceneCanvas />
        <CustomCursor />
        <Navigation />

        <main id="main" className="relative z-10">
          <Hero />
          <About />
          <ExperienceSection />
          <Skills />
          <Work />
          <Contact />
          <FinalScene />
        </main>
      </SmoothScroll>

      <ProjectDetail />
    </>
  )
}
