import type { Session } from './schema'

function uuidLike() {
  // good enough for UI mock; real app should use crypto.randomUUID()
  return `sess_${Math.random().toString(16).slice(2)}_${Date.now()}`
}

export function makeMockSession(): Session {
  const session_id = uuidLike()
  const started_at_ms = Date.now() - 60_000
  const samples = Array.from({ length: 30 }).map((_, i) => {
    const ts_ms = started_at_ms + i * 1000
    const lat = -23.561 + i * 0.00001
    const lon = -46.655 + i * 0.00001
    return {
      session_id,
      ts_ms,
      lat,
      lon,
      accuracy_m: 8 + (i % 4),
      heading_deg: (90 + i * 3) % 360,
      magnetic_uT: 35 + Math.sin(i / 3) * 2,
      platform: 'web' as const,
    }
  })

  return {
    session_id,
    started_at_ms,
    ended_at_ms: samples[samples.length - 1].ts_ms,
    samples,
  }
}
