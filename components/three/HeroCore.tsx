'use client'

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { MeshDistortMaterial } from '@react-three/drei'
import * as THREE from 'three'
import { S, journey } from '@/lib/scroll-state'
import { window01, damp } from '@/lib/utils'
import { makeGlowTexture } from './textures'

/**
 * HeroCore — the central "digital core": a distorted metallic icosahedron
 * inside a wireframe shell, wrapped in orbital rings and satellites.
 * Reacts to pointer, scroll progress and scroll velocity; recedes into
 * depth and restructures as the hero scrolls out.
 */
export function HeroCore() {
  const group = useRef<THREE.Group>(null)
  const core = useRef<THREE.Mesh>(null)
  const coreMat = useRef<any>(null)
  const wire = useRef<THREE.Mesh>(null)
  const wireMat = useRef<THREE.MeshBasicMaterial>(null)
  const ring1 = useRef<THREE.Mesh>(null)
  const ring2 = useRef<THREE.Mesh>(null)
  const ringMat1 = useRef<THREE.MeshBasicMaterial>(null)
  const ringMat2 = useRef<THREE.MeshBasicMaterial>(null)
  const sats = useRef<THREE.Group>(null)
  const glow = useRef<THREE.Sprite>(null)
  const glowMat = useRef<THREE.SpriteMaterial>(null)

  const glowTex = useMemo(() => makeGlowTexture(), [])
  const drift = useRef(0)

  useFrame((state, dt) => {
    const g = group.current
    if (!g) return
    const j = journey()
    const p = S.hero
    const intro = S.coreIntro
    const win = window01(j, -1, 0, 0.95, 1.12) * intro
    g.visible = win > 0.01
    if (!g.visible) return

    const t = state.clock.elapsedTime
    const ps = S.pointerSmooth
    if (!S.reducedMotion) drift.current += dt * 0.045

    // position: float + pointer parallax + recede on scroll
    g.position.set(
      ps.x * 0.42,
      -ps.y * 0.28 + (S.reducedMotion ? 0 : Math.sin(t * 0.65) * 0.09),
      -p * 7.5
    )

    // scale: enter from preloader, shrink slightly on scroll, breathe
    const breathe = S.reducedMotion ? 0 : Math.sin(t * 0.8) * 0.015
    g.scale.setScalar((0.45 + 0.55 * intro) * (1 - 0.38 * p) * (1 + breathe))

    // rotation: controlled, pointer-led, scroll-graduated
    const k = damp(dt, 0.05)
    g.rotation.y += (ps.x * 0.55 + p * 2.6 + drift.current - g.rotation.y) * k
    g.rotation.x += (-ps.y * 0.4 + p * 0.9 + Math.sin(t * 0.4) * 0.04 - g.rotation.x) * k

    // morph: core tightens, shell expands, distortion rises
    if (coreMat.current) {
      coreMat.current.distort = 0.3 + p * 0.4
      coreMat.current.opacity = win
    }
    if (core.current) core.current.scale.setScalar(1 - p * 0.35)
    if (wire.current) {
      wire.current.scale.setScalar(1.55 + p * 1.0)
      wire.current.rotation.y = -g.rotation.y * 0.6
    }
    if (wireMat.current) wireMat.current.opacity = 0.14 * win
    if (ring1.current) ring1.current.rotation.z += dt * (S.reducedMotion ? 0 : 0.1)
    if (ring2.current) ring2.current.rotation.z -= dt * 0.07
    if (ringMat1.current) ringMat1.current.opacity = 0.5 * win
    if (ringMat2.current) ringMat2.current.opacity = 0.22 * win
    if (sats.current && !S.reducedMotion) sats.current.rotation.z = t * 0.32
    if (glowMat.current) glowMat.current.opacity = 0.16 * win * (1 - p * 0.7)
  })

  return (
    <group ref={group}>
      <sprite ref={glow} scale={[8, 8, 1]}>
        {/* eslint-disable-next-line react/no-unknown-property */}
        <spriteMaterial
          ref={glowMat}
          map={glowTex}
          color="#6d5cff"
          transparent
          opacity={0.16}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </sprite>

      <mesh ref={core}>
        <icosahedronGeometry args={[1.35, 4]} />
        <MeshDistortMaterial
          ref={coreMat}
          color="#171722"
          metalness={0.9}
          roughness={0.2}
          distort={0.3}
          speed={1.4}
          transparent
          envMapIntensity={1.25}
          clearcoat={0.7}
          clearcoatRoughness={0.25}
        />
      </mesh>

      <mesh ref={wire} scale={1.55} rotation={[Math.PI / 5, 0, 0]}>
        <icosahedronGeometry args={[1.35, 1]} />
        <meshBasicMaterial
          ref={wireMat}
          wireframe
          color="#968bff"
          transparent
          opacity={0.14}
          depthWrite={false}
        />
      </mesh>

      <mesh ref={ring1} rotation={[Math.PI * 0.42, 0, 0]}>
        <torusGeometry args={[2.25, 0.006, 8, 160]} />
        <meshBasicMaterial ref={ringMat1} color="#b9b0ff" transparent opacity={0.5} depthWrite={false} />
      </mesh>

      <mesh ref={ring2} rotation={[Math.PI * 0.58, Math.PI * 0.2, 0]}>
        <torusGeometry args={[2.8, 0.004, 8, 160]} />
        <meshBasicMaterial ref={ringMat2} color="#6d5cff" transparent opacity={0.22} depthWrite={false} />
      </mesh>

      <group ref={sats} rotation={[Math.PI * 0.42, 0, 0]}>
        {[0, 1, 2].map((i) => (
          <mesh key={i} position={[Math.cos(i * 2.094) * 2.25, 0, Math.sin(i * 2.094) * 2.25]}>
            <sphereGeometry args={[0.035, 12, 12]} />
            <meshBasicMaterial color="#d8d2ff" transparent opacity={0.9} />
          </mesh>
        ))}
      </group>
    </group>
  )
}
