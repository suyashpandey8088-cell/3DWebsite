/**
 * SOUND — a tiny WebAudio ambient engine. Muted by default; only ever
 * started from an explicit user gesture (the sound toggle).
 */

class SoundEngine {
  private ctx: AudioContext | null = null
  private master: GainNode | null = null
  private nodes: Array<OscillatorNode> = []

  start() {
    if (this.ctx) return
    try {
      const Ctx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      this.ctx = new Ctx()
      const ctx = this.ctx

      const master = ctx.createGain()
      master.gain.value = 0
      master.connect(ctx.destination)

      const filter = ctx.createBiquadFilter()
      filter.type = 'lowpass'
      filter.frequency.value = 240
      filter.Q.value = 0.8
      filter.connect(master)

      // slow filter breathing
      const lfo = ctx.createOscillator()
      lfo.frequency.value = 0.06
      const lfoGain = ctx.createGain()
      lfoGain.gain.value = 90
      lfo.connect(lfoGain)
      lfoGain.connect(filter.frequency)
      lfo.start()
      this.nodes.push(lfo)

      const mk = (freq: number, detune = 0, type: OscillatorType = 'sine', gain = 0.5) => {
        const o = ctx.createOscillator()
        o.type = type
        o.frequency.value = freq
        o.detune.value = detune
        const g = ctx.createGain()
        g.gain.value = gain
        o.connect(g)
        g.connect(filter)
        o.start()
        this.nodes.push(o)
      }
      mk(55)
      mk(110.4)
      mk(164.8, 7, 'triangle', 0.16)

      this.master = master
      master.gain.linearRampToValueAtTime(0.045, ctx.currentTime + 1.6)
    } catch {
      this.ctx = null
    }
  }

  stop() {
    if (!this.ctx) return
    const ctx = this.ctx
    const nodes = this.nodes
    const master = this.master
    this.ctx = null
    this.nodes = []
    this.master = null
    try {
      master?.gain.linearRampToValueAtTime(0.0001, ctx.currentTime + 0.35)
    } catch {
      /* noop */
    }
    window.setTimeout(() => {
      nodes.forEach((n) => {
        try {
          n.stop()
        } catch {
          /* noop */
        }
      })
      ctx.close().catch(() => undefined)
    }, 500)
  }

  blip() {
    if (!this.ctx) return
    try {
      const ctx = this.ctx
      const o = ctx.createOscillator()
      const g = ctx.createGain()
      o.type = 'sine'
      o.frequency.value = 720
      g.gain.setValueAtTime(0.035, ctx.currentTime)
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.16)
      o.connect(g)
      g.connect(ctx.destination)
      o.start()
      o.stop(ctx.currentTime + 0.18)
    } catch {
      /* noop */
    }
  }
}

export const soundEngine = new SoundEngine()
