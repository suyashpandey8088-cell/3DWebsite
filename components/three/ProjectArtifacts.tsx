'use client'

import { useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { MeshDistortMaterial } from '@react-three/drei'
import * as THREE from 'three'
import { S, journey } from '@/lib/scroll-state'
import { window01, clamp } from '@/lib/utils'

/**
 * ProjectArtifacts — five distinct 3D monuments, one per project stage.
 * They ride the horizontal gallery in world space, react to hover, and
 * enlarge when a case study opens.
 */

/* COGNITA — a knowledge sphere of data points around a wire core */
function Cognita() {
  const group = useRef<THREE.Group>(null)
  const matPts = useRef<THREE.PointsMaterial>(null)
  const matWire = useRef<THREE.MeshBasicMaterial>(null)
  const pos = useMemo(() => {
    const n = 380
    const arr = new Float32Array(n * 3)
    const phi = Math.PI * (3 - Math.sqrt(5))
    for (let i = 0; i < n; i++) {
      const y = 1 - (i / (n - 1)) * 2
      const r = Math.sqrt(1 - y * y)
      const a = phi * i
      arr[i * 3] = Math.cos(a) * r * 0.95
      arr[i * 3 + 1] = y * 0.95
      arr[i * 3 + 2] = Math.sin(a) * r * 0.95
    }
    return arr
  }, [])
  useFrame((_, dt) => {
    if (group.current && !S.reducedMotion) group.current.rotation.y += dt * 0.16
    void matPts
    void matWire
  })
  return (
    <group ref={group}>
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[pos, 3]} />
        </bufferGeometry>
        <pointsMaterial ref={matPts} size={0.022} sizeAttenuation color="#a8a0ff" transparent opacity={0.85} depthWrite={false} />
      </points>
      <mesh>
        <icosahedronGeometry args={[0.45, 0]} />
        <meshBasicMaterial ref={matWire} wireframe color="#c9c9dd" transparent opacity={0.4} depthWrite={false} />
      </mesh>
    </group>
  )
}

/* PULSE — a ring of bars that pulse like a live waveform */
function Pulse() {
  const inst = useRef<THREE.InstancedMesh>(null)
  const mat = useRef<THREE.MeshBasicMaterial>(null)
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const COUNT = 48
  useFrame((state) => {
    const m = inst.current
    if (!m || S.reducedMotion) return
    const t = state.clock.elapsedTime
    for (let k = 0; k < COUNT; k++) {
      const a = (k / COUNT) * Math.PI * 2
      const h = 0.1 + Math.abs(Math.sin(a * 3 + t * 1.9)) * 0.55
      dummy.position.set(Math.cos(a) * 0.92, 0, Math.sin(a) * 0.92)
      dummy.scale.set(1, h, 1)
      dummy.rotation.y = -a
      dummy.updateMatrix()
      m.setMatrixAt(k, dummy.matrix)
    }
    m.instanceMatrix.needsUpdate = true
    void mat
  })
  useLayoutEffect(() => {
    const m = inst.current
    if (!m) return
    const d = new THREE.Object3D()
    for (let k = 0; k < COUNT; k++) {
      const a = (k / COUNT) * Math.PI * 2
      d.position.set(Math.cos(a) * 0.92, 0, Math.sin(a) * 0.92)
      d.scale.set(1, 0.3, 1)
      d.updateMatrix()
      m.setMatrixAt(k, d.matrix)
    }
    m.instanceMatrix.needsUpdate = true
  }, [])
  return (
    <group>
      <instancedMesh ref={inst} args={[undefined as any, undefined as any, COUNT]}>
        <boxGeometry args={[0.02, 1, 0.02]} />
        <meshBasicMaterial ref={mat} color="#968bff" transparent opacity={0.75} depthWrite={false} />
      </instancedMesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.92, 0.006, 8, 100]} />
        <meshBasicMaterial color="#6d5cff" transparent opacity={0.5} depthWrite={false} />
      </mesh>
    </group>
  )
}

/* ORBIT — a network torus with satellites */
function Orbit() {
  const spin = useRef<THREE.Group>(null)
  useFrame((_, dt) => {
    if (spin.current && !S.reducedMotion) spin.current.rotation.z += dt * 0.5
  })
  return (
    <group rotation={[Math.PI / 2.6, 0.2, 0]}>
      <mesh>
        <torusGeometry args={[0.95, 0.014, 10, 120]} />
        <meshBasicMaterial color="#a8a0ff" transparent opacity={0.6} depthWrite={false} />
      </mesh>
      <group ref={spin}>
        {[0, 1, 2].map((i) => (
          <mesh key={i} position={[Math.cos(i * 2.094) * 0.95, Math.sin(i * 2.094) * 0.95, 0]}>
            <sphereGeometry args={[0.05, 12, 12]} />
            <meshBasicMaterial color="#d8d2ff" transparent opacity={0.95} />
          </mesh>
        ))}
      </group>
      <mesh>
        <icosahedronGeometry args={[0.28, 0]} />
        <meshStandardMaterial color="#1a1a28" metalness={0.9} roughness={0.25} transparent envMapIntensity={1.2} />
      </mesh>
    </group>
  )
}

/* FLUX — a double helix pipeline */
function Flux() {
  const group = useRef<THREE.Group>(null)
  const inst = useRef<THREE.InstancedMesh>(null)
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const COUNT = 64
  useLayoutEffect(() => {
    const m = inst.current
    if (!m) return
    const d = new THREE.Object3D()
    for (let k = 0; k < COUNT; k++) {
      const t = k / (COUNT / 2)
      const strand = k < COUNT / 2 ? 0 : Math.PI
      const a = t * Math.PI * 4 + strand
      d.position.set(Math.cos(a) * 0.4, (t - 0.5) * 1.7, Math.sin(a) * 0.4)
      d.updateMatrix()
      m.setMatrixAt(k, d.matrix)
    }
    m.instanceMatrix.needsUpdate = true
  }, [])
  useFrame((_, dt) => {
    if (group.current && !S.reducedMotion) group.current.rotation.y += dt * 0.45
  })
  return (
    <group ref={group}>
      <instancedMesh ref={inst} args={[undefined as any, undefined as any, COUNT]}>
        <sphereGeometry args={[0.032, 8, 8]} />
        <meshBasicMaterial color="#968bff" transparent opacity={0.8} depthWrite={false} />
      </instancedMesh>
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.006, 0.006, 1.9, 6]} />
        <meshBasicMaterial color="#6d5cff" transparent opacity={0.35} depthWrite={false} />
      </mesh>
    </group>
  )
}

/* MIRAGE — a breathing distorted blob in a wire cage */
function Mirage() {
  const group = useRef<THREE.Group>(null)
  const mat = useRef<any>(null)
  useFrame((state) => {
    if (group.current && !S.reducedMotion) group.current.rotation.y -= 0.002
    if (mat.current && !S.reducedMotion) mat.current.distort = 0.45 + Math.sin(state.clock.elapsedTime * 0.7) * 0.12
  })
  return (
    <group ref={group}>
      <mesh>
        <icosahedronGeometry args={[0.72, 3]} />
        <MeshDistortMaterial
          ref={mat}
          color="#191926"
          metalness={0.85}
          roughness={0.25}
          distort={0.45}
          speed={2.2}
          transparent
          envMapIntensity={1.3}
        />
      </mesh>
      <mesh>
        <icosahedronGeometry args={[1.0, 1]} />
        <meshBasicMaterial wireframe color="#968bff" transparent opacity={0.18} depthWrite={false} />
      </mesh>
    </group>
  )
}

const ART = [Cognita, Pulse, Orbit, Flux, Mirage]

function Artifact({ i }: { i: number }) {
  const group = useRef<THREE.Group>(null)
  const viewport = useThree((s) => s.viewport)
  const mats = useRef<THREE.Material[]>([])
  const zoomRef = useRef(0)
  const Comp = ART[i]

  useFrame((_, dt) => {
    const g = group.current
    if (!g) return
    const j = journey()
    const win = window01(j, 3.9, 4.12, 4.88, 5.08)
    if (win <= 0.01) {
      g.visible = false
      return
    }
    g.visible = true

    const step = viewport.width * 0.92
    const frac = S.workActive
    const d = Math.abs(i - frac)
    const prox = Math.pow(clamp(1 - d * 0.95, 0, 1), 0.8)

    // hover boost
    const hover = S.hoverProject === i ? 1 : 0
    zoomRef.current += ((S.detailOpen > 0.5 && d < 0.5 ? 1 : 0) - zoomRef.current) * 0.08

    const baseScale = (S.mobile ? 0.55 : 1) * (0.55 + prox * 0.55)
    const scale = baseScale * (1 + hover * 0.08 + zoomRef.current * 1.15)
    g.scale.setScalar(scale)

    const offset = S.mobile ? 0 : viewport.width * 0.2
    g.position.set((i - frac) * step + offset, S.mobile ? 1.35 : 0, -0.8)
    if (!S.reducedMotion) g.rotation.y += dt * (0.12 + hover * 0.25)
    g.rotation.x = (S.reducedMotion ? 0 : S.pointerSmooth.y * 0.15)

    // fade materials by proximity + detail dim
    const op = prox * win * (1 - S.detailOpen * 0.9)
    if (mats.current.length === 0) {
      g.traverse((o) => {
        const m = (o as THREE.Mesh).material as THREE.Material | undefined
        if (m && m !== (undefined as any) && !Array.isArray(m)) {
          if (m.userData.baseOpacity === undefined) m.userData.baseOpacity = (m as THREE.Material & { opacity?: number }).opacity ?? 1
          mats.current.push(m)
        }
      })
    }
    mats.current.forEach((m) => {
      const mm = m as THREE.Material & { opacity: number }
      mm.transparent = true
      mm.opacity = (m.userData.baseOpacity as number) * Math.max(op, zoomRef.current * win)
    })
  })

  return (
    <group ref={group} visible={false}>
      <Comp />
    </group>
  )
}

export function ProjectArtifacts() {
  return (
    <group>
      {ART.map((_, i) => (
        <Artifact key={i} i={i} />
      ))}
    </group>
  )
}
