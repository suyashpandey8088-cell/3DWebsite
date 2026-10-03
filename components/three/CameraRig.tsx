'use client'

import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { S, journey } from '@/lib/scroll-state'
import { damp } from '@/lib/utils'

/**
 * CameraRig — one continuous camera journey across the whole page.
 * The journey coordinate j runs 0 (hero) → 7 (end); keyframes define
 * position, everything is damped so motion stays cinematic.
 */

const KEYS: Array<[number, [number, number, number]]> = [
  [0, [0, 0, 8.0]], // hero
  [1, [0, -0.15, 7.35]], // → about
  [2, [0.55, 0.1, 7.7]], // → experience
  [3, [-0.45, 0.05, 7.5]], // → skills
  [4, [0, 0.3, 8.7]], // → work
  [5, [0.25, 0, 7.3]], // → contact
  [6, [0, -0.05, 7.6]], // → end
  [7, [0, 0, 7.0]],
]

function sample(j: number, out: THREE.Vector3) {
  const jj = Math.max(0, Math.min(7, j))
  for (let i = 0; i < KEYS.length - 1; i++) {
    const [a, pa] = KEYS[i]
    const [b, pb] = KEYS[i + 1]
    if (jj >= a && jj <= b) {
      let t = (jj - a) / (b - a)
      t = t * t * (3 - 2 * t)
      out.set(
        pa[0] + (pb[0] - pa[0]) * t,
        pa[1] + (pb[1] - pa[1]) * t,
        pa[2] + (pb[2] - pa[2]) * t
      )
      return
    }
  }
  const last = KEYS[KEYS.length - 1][1]
  out.set(last[0], last[1], last[2])
}

export function CameraRig() {
  const camera = useThree((s) => s.camera)
  const target = useRef(new THREE.Vector3(0, 0, 8))
  const look = useRef(new THREE.Vector3(0, 0, 0))

  useFrame((_, dt) => {
    const j = journey()
    sample(j, target.current)

    // pointer parallax + case-study zoom
    const px = S.reducedMotion ? 0 : S.pointerSmooth.x
    const py = S.reducedMotion ? 0 : S.pointerSmooth.y
    target.current.x += px * 0.42
    target.current.y += -py * 0.26
    target.current.z -= S.detailOpen * 1.1

    const k = damp(Math.min(dt, 0.05), 0.08)
    camera.position.x += (target.current.x - camera.position.x) * k
    camera.position.y += (target.current.y - camera.position.y) * k
    camera.position.z += (target.current.z - camera.position.z) * k

    look.current.set(px * 0.55, -py * 0.35, 0)
    camera.lookAt(look.current)
  })

  return null
}
