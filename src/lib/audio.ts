/** WebAudio cues — no audio assets needed, works offline. */

let ctx: AudioContext | null = null

function ensureCtx(): AudioContext | null {
  try {
    ctx ??= new AudioContext()
    if (ctx.state === 'suspended') void ctx.resume()
    return ctx
  } catch {
    return null
  }
}

function tone(freq: number, durationMs: number, delayMs = 0, volume = 0.16, type: OscillatorType = 'sine') {
  const ac = ensureCtx()
  if (!ac) return
  const t0 = ac.currentTime + delayMs / 1000
  const osc = ac.createOscillator()
  const gain = ac.createGain()
  osc.type = type
  osc.frequency.value = freq
  gain.gain.setValueAtTime(0, t0)
  gain.gain.linearRampToValueAtTime(volume, t0 + 0.015)
  gain.gain.exponentialRampToValueAtTime(0.001, t0 + durationMs / 1000)
  osc.connect(gain).connect(ac.destination)
  osc.start(t0)
  osc.stop(t0 + durationMs / 1000 + 0.05)
}

export const sounds = {
  /** Short tick for 3-2-1 countdowns. */
  tick: () => tone(880, 90),
  /** Work phase begins. */
  go: () => {
    tone(660, 110)
    tone(990, 160, 120)
  },
  /** Set complete. */
  done: () => {
    tone(784, 120)
    tone(988, 120, 130)
    tone(1319, 220, 260)
  },
  /** Rest over soon warning. */
  warn: () => tone(523, 140, 0, 0.12, 'triangle'),
  /** Level mastered fanfare. */
  fanfare: () => {
    tone(523, 140)
    tone(659, 140, 150)
    tone(784, 140, 300)
    tone(1047, 320, 450)
  },
}

export function vibrate(pattern: number | number[]) {
  try {
    navigator.vibrate?.(pattern)
  } catch {
    /* unsupported */
  }
}
