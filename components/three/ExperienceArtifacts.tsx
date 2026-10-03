'use client'

import { useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { S, journey } from '@/lib/scroll-state'
import { window01 } from '@/lib/utils'
import { EXPERIENCES } from '@/lib/content'

/**
 * ExperienceArtifacts — one small sculptural object per experience node,
 * crossfading as the horizontal timeline travels. A tinted light follows
 * the active node so each "scene" shifts mood subtly.
 */

function useFadeMaterials() {
  const mats = useRef<THREE.Material[]>([])
  const add = (m: THREE.Material | null) => {
    if (m && !mats.current.includes(m)) mats.current.push(m)
  }
  return { mats, add }
}

function Artifact({ i }: { i: number }) {
  const group = useRef<THREE.Group>(null)
  const { mats, add } = useFadeMaterials()
  const inst = useRef<THREE.InstancedMesh>(null)

  const cubePositions = useMemo(() => {
    const out: Array<[number, number, number]> = []
    for (let x = -1; x <= 1; x++)
      for (let y = -1; y <= 1; y++)
        for (let z = -1; z <= 1; z++) out.push([x * 0.2, y * 0.2, z * 0.2])
    return out
  }, [])

  useLayoutEffect(() => {
    if (i !== 1 || !inst.current) return
    const dummy = new THREE.Object3D()
    cubePositions.forEach((p, k) => {
      dummy.position.set(p[0], p[1], p[2])
      dummy.updateMatrix()
      inst.current!.setMatrixAt(k, dummy.matrix)
    })
    inst.current.instanceMatrix.needsUpdate = true
  }, [i, cubePositions])

  useFrame((_, dt) => {
    const g = group.current
    if (!g) return
    const j = journey()
    const win = window01(j, 1.9, 2.1, 2.88, 3.08)
    const frac = S.xpActive
    const d = Math.abs(i - frac)
    const w = Math.pow(Math.max(0, 1 - d), 1.15) * win
    g.visible = w > 0.02
    if (!g.visible) return

    g.scale.setScalar(0.55 + w * 0.6)
    g.position.x = (i - frac) * 2.1
    if (!S.reducedMotion) g.rotation.y += dt * (0.22 + i * 0.05)
    const op = w * (1 - S.detailOpen * 0.9)
    mats.current.forEach((m) => {
      m.opacity = op * (m.userData.baseOpacity ?? (m.userData.baseOpacity = m.opacity ?? 1))
    })
  })

  return (
    <group ref={group} visible={false}>
      {i === 0 && (
        <>
          <mesh>
            <icosahedronGeometry args={[0.6, 0]} />
            <meshStandardMaterial
              ref={add}
              color="#1a1a28"
              metalness={0.85}
              roughness={0.3}
              transparent
              envMapIntensity={1.1}
            />
          </mesh>
          <mesh>
            <icosahedronGeometry args={[0.85, 0]} />
            <meshBasicMaterial ref={add} wireframe color="#968bff" transparent opacity={0.5} depthWrite={false} />
          </mesh>
        </>
      )}
      {i === 1 && (
        <instancedMesh ref={inst} args={[undefined as any, undefined as any, 27]}>
          <boxGeometry args={[0.1, 0.1, 0.1]} />
          <meshBasicMaterial ref={add} wireframe color="#8f95b8" transparent opacity={0.5} depthWrite={false} />
        </instancedMesh>
      )}
      {i === 2 && (
        <mesh>
          <torusKnotGeometry args={[0.38, 0.12, 120, 12]} />
          <meshBasicMaterial ref={add} wireframe color="#968bff" transparent opacity={0.5} depthWrite={false} />
        </mesh>
      )}
      {i === 3 && (
        <>
          <mesh>
            <sphereGeometry args={[0.58, 14, 10]} />
            <meshBasicMaterial ref={add} wireframe color="#c9c9dd" transparent opacity={0.35} depthWrite={false} />
          </mesh>
          <mesh position={[0.75, 0.2, 0]}>
            <sphereGeometry args={[0.045, 10, 10]} />
            <meshBasicMaterial ref={add} color="#d8d2ff" transparent opacity={0.9} />
          </mesh>
          <mesh position={[-0.7, -0.25, 0.2]}>
            <sphereGeometry args={[0.035, 10, 10]} />
            <meshBasicMaterial ref={add} color="#968bff" transparent opacity={0.9} />
          </mesh>
        </>
      )}
      {i === 4 && (
        <>
          <mesh>
            <octahedronGeometry args={[0.55, 0]} />
            <meshStandardMaterial
              ref={add}
              color="#1a1a28"
              metalness={0.85}
              roughness={0.3}
              transparent
              envMapIntensity={1.1}
            />
          </mesh>
          <mesh rotation={[Math.PI / 2.4, 0.3, 0]}>
            <torusGeometry args={[0.85, 0.008, 8, 90]} />
            <meshBasicMaterial ref={add} color="#968bff" transparent opacity={0.55} depthWrite={false} />
          </mesh>
        </>
      )}
    </group>
  )
}

export function ExperienceArtifacts() {
  const parent = useRef<THREE.Group>(null)
  const light = useRef<THREE.PointLight>(null)
  const tints = useMemo(() => EXPERIENCES.map((e) => new THREE.Color(e.tint)), [])
  const target = useMemo(() => new THREE.Color(), [])

  useFrame((_, dt) => {
    const g = parent.current
    if (!g) return
    const j = journey()
    const win = window01(j, 1.9, 2.1, 2.9, 3.1)
    g.visible = win > 0.01
    if (!g.visible) return

    g.position.set(0, S.mobile ? 2.15 : 1.75, S.mobile ? -3.2 : -2.3)
    g.scale.setScalar(S.mobile ? 0.72 : 1)

    if (light.current) {
      const idx = Math.round(Math.min(EXPERIENCES.length - 1, Math.max(0, S.xpActive)))
      target.copy(tints[idx])
      light.current.color.lerp(target, 1 - Math.pow(0.02, dt))
      light.current.intensity = 22 * win * (1 - S.detailOpen)
    }
  })

  return (
    <group ref={parent} visible={false}>
      <pointLight ref={light} position={[0, 0, 1.2]} intensity={0} distance={14} decay={2} />
      {EXPERIENCES.map((_, i) => (
        <Artifact key={i} i={i} />
      ))}
    </group>
  )
}
