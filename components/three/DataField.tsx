'use client'

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { S, journey } from '@/lib/scroll-state'
import { window01, damp } from '@/lib/utils'

/**
 * DataField — the ambient particle universe. Two point clouds (dust + a
 * sparse accent layer), slowly rotating, parallaxed against the pointer.
 */
export function DataField() {
  const group = useRef<THREE.Group>(null)
  const matDust = useRef<THREE.PointsMaterial>(null)
  const matAccent = useRef<THREE.PointsMaterial>(null)

  const dust = useMemo(() => {
    const n = 1500
    const pos = new Float32Array(n * 3)
    for (let i = 0; i < n; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 30
      pos[i * 3 + 1] = (Math.random() - 0.5) * 18
      pos[i * 3 + 2] = (Math.random() - 0.5) * 26 - 2
    }
    return pos
  }, [])

  const accent = useMemo(() => {
    const n = 90
    const pos = new Float32Array(n * 3)
    for (let i = 0; i < n; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 26
      pos[i * 3 + 1] = (Math.random() - 0.5) * 15
      pos[i * 3 + 2] = (Math.random() - 0.5) * 22 - 1
    }
    return pos
  }, [])

  useFrame((_, dt) => {
    const g = group.current
    if (!g) return
    const j = journey()
    const base = Math.max(window01(j, -1, 0, 6.9, 7.2), 0.14) * (1 - S.detailOpen * 0.85)
    if (matDust.current) matDust.current.opacity = 0.4 * base
    if (matAccent.current) matAccent.current.opacity = 0.7 * base

    if (!S.reducedMotion) g.rotation.y += dt * 0.006

    const k = damp(dt, 0.04)
    const tx = S.reducedMotion ? 0 : -S.pointerSmooth.x * 0.5
    const ty = S.reducedMotion ? 0 : S.pointerSmooth.y * 0.3
    g.position.x += (tx - g.position.x) * k
    g.position.y += (ty - g.position.y) * k
  })

  return (
    <group ref={group}>
      <points frustumCulled={false}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[dust, 3]} />
        </bufferGeometry>
        <pointsMaterial
          ref={matDust}
          size={0.03}
          sizeAttenuation
          color="#8f95b8"
          transparent
          opacity={0.4}
          depthWrite={false}
        />
      </points>
      <points frustumCulled={false}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[accent, 3]} />
        </bufferGeometry>
        <pointsMaterial
          ref={matAccent}
          size={0.07}
          sizeAttenuation
          color="#6d5cff"
          transparent
          opacity={0.7}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  )
}
