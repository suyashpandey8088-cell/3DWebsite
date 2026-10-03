'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { S, journey } from '@/lib/scroll-state'
import { window01 } from '@/lib/utils'

/**
 * AboutShapes — drifting wireframe solids that surround the visitor during
 * the About chapter. Small, quiet, parallaxed against the cursor.
 */

interface ShapeDef {
  geo: 'octa' | 'tetra' | 'torus' | 'box' | 'icosa' | 'ring'
  r: number
  speed: number
  phase: number
  y: number
  z: number
  s: number
  accent: boolean
}

const SHAPES: ShapeDef[] = [
  { geo: 'octa', r: 3.4, speed: 0.16, phase: 0.3, y: 0.9, z: -1.6, s: 0.5, accent: true },
  { geo: 'tetra', r: 4.6, speed: -0.11, phase: 1.9, y: -0.7, z: -2.6, s: 0.62, accent: false },
  { geo: 'torus', r: 2.7, speed: 0.21, phase: 3.1, y: 1.5, z: 0.4, s: 0.34, accent: false },
  { geo: 'box', r: 5.2, speed: -0.08, phase: 4.4, y: 0.2, z: -3.6, s: 0.5, accent: true },
  { geo: 'icosa', r: 3.9, speed: 0.13, phase: 5.5, y: -1.4, z: -1.2, s: 0.4, accent: false },
  { geo: 'ring', r: 5.8, speed: 0.07, phase: 2.2, y: 1.1, z: -4.2, s: 0.85, accent: true },
]

function Geometry({ geo }: { geo: ShapeDef['geo'] }) {
  switch (geo) {
    case 'octa':
      return <octahedronGeometry args={[0.6, 0]} />
    case 'tetra':
      return <tetrahedronGeometry args={[0.65, 0]} />
    case 'torus':
      return <torusGeometry args={[0.45, 0.16, 8, 24]} />
    case 'box':
      return <boxGeometry args={[0.55, 0.55, 0.55]} />
    case 'icosa':
      return <icosahedronGeometry args={[0.5, 0]} />
    case 'ring':
      return <torusGeometry args={[0.55, 0.02, 8, 48]} />
  }
}

function Shape({ def, index }: { def: ShapeDef; index: number }) {
  const mesh = useRef<THREE.Mesh>(null)
  const mat = useRef<THREE.MeshBasicMaterial>(null)

  useFrame((state, dt) => {
    const m = mesh.current
    if (!m) return
    const j = journey()
    const win = window01(j, 0.92, 1.12, 1.86, 2.06)
    m.visible = win > 0.01
    if (!m.visible) return

    const t = state.clock.elapsedTime
    const a = def.phase + t * def.speed
    const ps = S.pointerSmooth
    const depth = 0.12 + (2 - def.z) * 0.05

    m.position.set(
      Math.cos(a) * def.r + (S.reducedMotion ? 0 : ps.x * depth),
      def.y + Math.sin(a * 0.8) * def.r * 0.32 - (S.reducedMotion ? 0 : ps.y * depth * 0.7),
      def.z
    )
    if (!S.reducedMotion) {
      m.rotation.x += dt * def.speed * 1.6
      m.rotation.y += dt * def.speed * 2.2
    }
    if (mat.current) mat.current.opacity = (def.accent ? 0.2 : 0.11) * win * (1 - S.detailOpen)
    m.scale.setScalar(def.s * (0.9 + 0.1 * Math.sin(index + t * 0.5)))
  })

  return (
    <mesh ref={mesh} visible={false}>
      <Geometry geo={def.geo} />
      <meshBasicMaterial
        ref={mat}
        wireframe
        color={def.accent ? '#968bff' : '#c9c9dd'}
        transparent
        opacity={0.1}
        depthWrite={false}
      />
    </mesh>
  )
}

export function AboutShapes() {
  return (
    <group>
      {SHAPES.map((def, i) => (
        <Shape key={i} def={def} index={i} />
      ))}
    </group>
  )
}
