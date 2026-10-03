'use client'

import { Component, useEffect, useRef, useState, type ReactNode } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Environment, Lightformer, PerformanceMonitor } from '@react-three/drei'
import { useUI } from '@/lib/store'
import { CameraRig } from '@/components/three/CameraRig'
import { HeroCore } from '@/components/three/HeroCore'
import { DataField } from '@/components/three/DataField'
import { AboutShapes } from '@/components/three/AboutShapes'
import { ExperienceArtifacts } from '@/components/three/ExperienceArtifacts'
import { ProjectArtifacts } from '@/components/three/ProjectArtifacts'
import { FinalForm } from '@/components/three/FinalForm'

/** Signals the first rendered WebGL frame to the preloader. */
function ReadySignal() {
  const done = useRef(false)
  useFrame(() => {
    if (!done.current) {
      done.current = true
      useUI.getState().set({ canvasReady: true })
    }
  })
  return null
}

/** If WebGL is unavailable the site degrades gracefully to the DOM experience. */
class CanvasBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  render() {
    return this.state.failed ? null : this.props.children
  }
}

export default function SceneCanvas() {
  const isMobile = useUI((s) => s.isMobile)
  const [dpr, setDpr] = useState<number | [number, number]>([1, 1.75])

  useEffect(() => {
    setDpr(isMobile ? [1, 1.5] : [1, 1.75])
  }, [isMobile])

  return (
    <div className="pointer-events-none fixed inset-0 z-0" aria-hidden="true">
      <CanvasBoundary>
        <Canvas
          dpr={dpr}
          camera={{ fov: 42, near: 0.1, far: 60, position: [0, 0, 8] }}
          gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        >
          <PerformanceMonitor
            onDecline={() => setDpr(1)}
            onIncline={() => setDpr(isMobile ? [1, 1.5] : [1, 1.75])}
          >
            <fog attach="fog" args={['#08080d', 9, 30]} />
            <ambientLight intensity={0.35} />
            <directionalLight position={[4, 6, 4]} intensity={1.6} color="#dfe3ff" />
            <pointLight position={[-6, -2, -4]} intensity={26} distance={30} color="#6d5cff" />

            {/* procedural studio environment — no network HDRs */}
            <Environment resolution={128} frames={1}>
              <color attach="background" args={['#05050a']} />
              <Lightformer form="rect" intensity={3} position={[0, 4, -6]} scale={[9, 3, 1]} color="#b9c2ff" />
              <Lightformer form="rect" intensity={2} position={[-5, 1, 2]} rotation-y={Math.PI / 2} scale={[6, 2, 1]} color="#ffffff" />
              <Lightformer form="rect" intensity={2.4} position={[5, -1, 2]} rotation-y={-Math.PI / 2} scale={[6, 2, 1]} color="#6d5cff" />
              <Lightformer form="circle" intensity={1.6} position={[0, 6, 1]} rotation-x={Math.PI / 2} scale={3} color="#8f80ff" />
            </Environment>

            <CameraRig />
            <ReadySignal />
            <HeroCore />
            <DataField />
            <AboutShapes />
            <ExperienceArtifacts />
            <ProjectArtifacts />
            <FinalForm />
          </PerformanceMonitor>
        </Canvas>
      </CanvasBoundary>
    </div>
  )
}
