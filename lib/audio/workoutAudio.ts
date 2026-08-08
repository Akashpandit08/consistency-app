/**
 * Zero-Cost Web Audio Synthesizer for Workout Cues & Alerts
 *
 * Cost Optimization:
 * - 0 bytes downloaded from server / CDN
 * - Zero licensing fees / copyright issues
 * - 0ms latency sound generation via Web Audio API oscillators
 * - Automatic suspension when idle to save device battery
 */

class SoundSynthesizer {
  private ctx: AudioContext | null = null
  private isMuted = false

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      if (AudioCtx) {
        this.ctx = new AudioCtx()
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      void this.ctx.resume()
    }
    return this.ctx
  }

  public setMuted(muted: boolean): void {
    this.isMuted = muted
  }

  public getIsMuted(): boolean {
    return this.isMuted
  }

  /** Short tick for rest timer seconds (e.g. 3, 2, 1) */
  public playTick(frequency = 880, duration = 0.08): void {
    if (this.isMuted) return
    const ctx = this.getContext()
    if (!ctx) return

    try {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = 'sine'
      osc.frequency.setValueAtTime(frequency, ctx.currentTime)

      gain.gain.setValueAtTime(0.15, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(ctx.currentTime)
      osc.stop(ctx.currentTime + duration)
    } catch {
      // Ignore audio synthesis errors on locked browsers
    }
  }

  /** Countdown final beep when rest timer hits 0 */
  public playRestFinished(): void {
    if (this.isMuted) return
    const ctx = this.getContext()
    if (!ctx) return

    try {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = 'triangle'
      osc.frequency.setValueAtTime(1320, ctx.currentTime) // High E
      osc.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.3) // High A

      gain.gain.setValueAtTime(0.25, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(ctx.currentTime)
      osc.stop(ctx.currentTime + 0.35)
    } catch {
      // Ignore
    }
  }

  /** Joyful celebratory arpeggio for Personal Records (PRs) */
  public playPRCelebration(): void {
    if (this.isMuted) return
    const ctx = this.getContext()
    if (!ctx) return

    try {
      const notes = [523.25, 659.25, 783.99, 1046.5] // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()

        osc.type = 'sine'
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08)

        gain.gain.setValueAtTime(0.2, ctx.currentTime + idx * 0.08)
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.08 + 0.25)

        osc.connect(gain)
        gain.connect(ctx.destination)

        osc.start(ctx.currentTime + idx * 0.08)
        osc.stop(ctx.currentTime + idx * 0.08 + 0.25)
      })
    } catch {
      // Ignore
    }
  }

  /** Set completed chime */
  public playSetCompleted(): void {
    if (this.isMuted) return
    this.playTick(1046.5, 0.12) // C6 quick chime
  }

  /** Workout finished fanfare */
  public playWorkoutComplete(): void {
    if (this.isMuted) return
    const ctx = this.getContext()
    if (!ctx) return

    try {
      const notes = [440, 554.37, 659.25, 880] // A4, C#5, E5, A5
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()

        osc.type = 'triangle'
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.12)

        gain.gain.setValueAtTime(0.22, ctx.currentTime + idx * 0.12)
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.12 + 0.4)

        osc.connect(gain)
        gain.connect(ctx.destination)

        osc.start(ctx.currentTime + idx * 0.12)
        osc.stop(ctx.currentTime + idx * 0.12 + 0.4)
      })
    } catch {
      // Ignore
    }
  }

  /** Dual-Tone Melodic Alarm Chime for Meals & Workouts */
  public playAlarmChime(): void {
    if (this.isMuted) return
    const ctx = this.getContext()
    if (!ctx) return

    try {
      // Two-phase pulse: Ding-Dong Ding-Dong
      const pattern = [
        { f: 880, t: 0, d: 0.18 },
        { f: 1174.66, t: 0.2, d: 0.25 },
        { f: 880, t: 0.55, d: 0.18 },
        { f: 1174.66, t: 0.75, d: 0.4 },
      ]

      pattern.forEach(({ f, t, d }) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()

        osc.type = 'sine'
        osc.frequency.setValueAtTime(f, ctx.currentTime + t)

        gain.gain.setValueAtTime(0.3, ctx.currentTime + t)
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + t + d)

        osc.connect(gain)
        gain.connect(ctx.destination)

        osc.start(ctx.currentTime + t)
        osc.stop(ctx.currentTime + t + d)
      })
    } catch {
      // Ignore
    }
  }

  /** High-Energy Beep Alert */
  public playEnergeticWakeup(): void {
    if (this.isMuted) return
    const ctx = this.getContext()
    if (!ctx) return

    try {
      for (let i = 0; i < 4; i++) {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        const t = ctx.currentTime + i * 0.14

        osc.type = 'sawtooth'
        osc.frequency.setValueAtTime(1046.5, t)

        gain.gain.setValueAtTime(0.2, t)
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1)

        osc.connect(gain)
        gain.connect(ctx.destination)

        osc.start(t)
        osc.stop(t + 0.1)
      }
    } catch {
      // Ignore
    }
  }

  /** Gentle Harmonic Gong / Bell */
  public playGentleReminder(): void {
    if (this.isMuted) return
    const ctx = this.getContext()
    if (!ctx) return

    try {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = 'sine'
      osc.frequency.setValueAtTime(659.25, ctx.currentTime) // E5
      osc.frequency.exponentialRampToValueAtTime(523.25, ctx.currentTime + 0.8) // Glide to C5

      gain.gain.setValueAtTime(0.28, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.9)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(ctx.currentTime)
      osc.stop(ctx.currentTime + 0.9)
    } catch {
      // Ignore
    }
  }

  /** Water Hydration Drop Sound */
  public playHydrationAlert(): void {
    if (this.isMuted) return
    const ctx = this.getContext()
    if (!ctx) return

    try {
      // FM pop like a water bubble / droplet
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = 'sine'
      osc.frequency.setValueAtTime(600, ctx.currentTime)
      osc.frequency.exponentialRampToValueAtTime(1600, ctx.currentTime + 0.12)

      gain.gain.setValueAtTime(0.35, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(ctx.currentTime)
      osc.stop(ctx.currentTime + 0.18)
    } catch {
      // Ignore
    }
  }

  /** Play specific alarm tone by name */
  public playAlarmByTone(tone: string = 'chime'): void {
    switch (tone) {
      case 'energetic':
        this.playEnergeticWakeup()
        break
      case 'gentle':
        this.playGentleReminder()
        break
      case 'hydration':
        this.playHydrationAlert()
        break
      case 'fanfare':
        this.playWorkoutComplete()
        break
      case 'chime':
      default:
        this.playAlarmChime()
        break
    }
  }
}

export const soundFx = new SoundSynthesizer()
