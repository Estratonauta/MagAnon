import { Capacitor } from '@capacitor/core'

/**
 * JS bridge contract for native sensor streaming.
 *
 * Web builds should degrade gracefully (no magnetometer access).
 * The native iOS/Android plugin will be implemented later.
 */
export type SensorSample = {
  ts_ms: number
  /** Magnetic vector in microtesla */
  magnetic_vec_uT?: { x: number; y: number; z: number }
  heading_deg?: number
}

export type Unsubscribe = () => void

export type SensorsBridge = {
  isAvailable(): boolean
  start(): Promise<void>
  stop(): Promise<void>
  subscribe(cb: (s: SensorSample) => void): Unsubscribe
}

let timer: number | null = null
let listeners: Array<(s: SensorSample) => void> = []

export const Sensors: SensorsBridge = {
  isAvailable() {
    // Eventually: return Capacitor.isNativePlatform() && plugin present.
    return Capacitor.isNativePlatform()
  },

  async start() {
    // Stub: emit fake samples on native builds until plugin exists.
    if (timer != null) return
    const start = Date.now()
    timer = window.setInterval(() => {
      const i = Math.floor((Date.now() - start) / 1000)
      const sample: SensorSample = {
        ts_ms: Date.now(),
        magnetic_vec_uT: { x: 10 + Math.sin(i / 3), y: 5, z: 42 },
        heading_deg: (90 + i * 2) % 360,
      }
      for (const cb of listeners) cb(sample)
    }, 1000)
  },

  async stop() {
    if (timer != null) {
      window.clearInterval(timer)
      timer = null
    }
  },

  subscribe(cb) {
    listeners.push(cb)
    return () => {
      listeners = listeners.filter((x) => x !== cb)
    }
  },
}
