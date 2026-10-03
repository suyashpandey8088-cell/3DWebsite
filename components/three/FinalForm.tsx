'use client'

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { S, journey } from '@/lib/scroll-state'
import { smoothstep, damp } from '@/lib/utils'
import { makeGlowTexture } from './textures'

/**
 * FinalForm — the closing object: a dark-metal torus knot wrapped in
 * counter-rotating rings. It assembles as the visitor reaches the end of
 * the world and answers the cursor from then on.
 */
export function FinalForm() {
  const group = useRef<THREE.Group>(null)
  const knot = useRef<THREE.Mesh>(null)
  const knotMat = useRef<THREE.MeshStandardMaterial>(null)
  const ringA = useRef<THREE.Mesh>(null)
  const ringB = useRef<THREE.Mesh>(null)
  const ringMatA = useRef<THREE.MeshBasicMaterial>(null)
  const ringMatB = useRef<THREE.MeshBasicMaterial>(null)
  const glow = useRef<THREE.Sprite>(null)
  const glowMat = useRef<THREE.SpriteMaterial>(null)
  const glowTex = useMemo(() => makeGlowTexture(), [])

  useFrame((state, dt) => {
    const g = group.current
    if (!g) return
    const j = journey()
    /* assembles through late contact, centerpiece by the finale */
    const a = smoothstep(5.35, 6.05, j)
    g.visible = a > 0.01
    if (!g.visible) return

    const t = state.clock.elapsedTime
    const ps = S.pointerSmooth

    const breathe = S.reducedMotion ? 0 : Math.sin(t * 0.9) * 0.02
    g.scale.setScalar(a * (1 + breathe))

    const k = damp(dt, 0.05)
    g.rotation.y += (ps.x * 0.5 + (S.reducedMotion ? 0.4 : t * 0.12) - g.rotation.y) * k
    g.rotation.x += (-ps.y * 0.35 + 0.25 - g.rotation.x) * k

    if (ringA.current && !S.reducedMotion) ringA.current.rotation.z += dt * 0.16
    if (ringB.current && !S.reducedMotion) ringB.current.rotation.z -= dt * 0.1

    const dim = 1 - S.detailOpen
    if (knotMat.current) knotMat.current.opacity = (0.45 + 0.55 * smoothstep(5.9, 6.4, j)) * dim
    if (ringMatA.current) ringMatA.current.opacity = 0.6 * a * dim
    if (ringMatB.current) ringMatB.current.opacity = 0.35 * a * dim
    if (glowMat.current) glowMat.current.opacity = 0.22 * a * dim
    if (knot.current && knotMat.current) {
      knotMat.current.emissiveIntensity = 0.12 + Math.sin(t * 1.4) * 0.04
    }
  })

  return (
    <group ref={group} position={[0, -0.1, -0.4]} visible={false}>
      <sprite ref={glow} scale={[9, 9, 1]}>
        <spriteMaterial
          ref={glowMat}
          map={glowTex}
          color="#6d5cff"
          transparent
          opacity={0.14}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </sprite>

      <mesh ref={knot}>
        <torusKnotGeometry args={[1.02, 0.24, 220, 26]} />
        <meshStandardMaterial
          ref={knotMat}
          color="#15151f"
          metalness={0.88}
          roughness={0.24}
          emissive="#4b3fd9"
          emissiveIntensity={0.12}
          transparent
          envMapIntensity={1.35}
        />
      </mesh>

      <mesh ref={ringA} rotation={[Math.PI * 0.46, 0.2, 0]}>
        <torusGeometry args={[2.05, 0.006, 8, 160]} />
        <meshBasicMaterial ref={ringMatA} color="#b9b0ff" transparent opacity={0.4} depthWrite={false} />
      </mesh>
      <mesh ref={ringB} rotation={[Math.PI * 0.6, -Math.PI * 0.25, 0]}>
        <torusGeometry args={[2.5, 0.004, 8, 160]} />
        <meshBasicMaterial ref={ringMatB} color="#6d5cff" transparent opacity={0.22} depthWrite={false} />
      </mesh>
    </group>
  )
}
