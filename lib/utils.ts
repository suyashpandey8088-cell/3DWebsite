export const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v))

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t

export const smoothstep = (a: number, b: number, x: number) => {
  const t = clamp((x - a) / (b - a), 0, 1)
  return t * t * (3 - 2 * t)
}

/** visibility window: fades in between a..b, fades out between c..d */
export const window01 = (x: number, a: number, b: number, c: number, d: number) =>
  smoothstep(a, b, x) * (1 - smoothstep(c, d, x))

/** frame-rate independent damping factor (≈ 6% per frame at 60fps for k=0.06) */
export const damp = (dt: number, k = 0.06) => 1 - Math.pow(1 - k, dt * 60)
