export type MagneticVec = { x: number; y: number; z: number }

/** Canonical per-sample payload. Keep in sync with docs + server validation. */
export type Sample = {
  session_id: string
  ts_ms: number
  lat: number
  lon: number

  accuracy_m?: number
  altitude_m?: number
  heading_deg?: number

  /** Total magnitude (preferred when available) */
  magnetic_uT?: number

  /** Optional raw vector if available from native bridge */
  magnetic_vec_uT?: MagneticVec

  /** Basic quality-control flags (best-effort; optional). */
  qc?: {
    gps_ok?: boolean
    mag_ok?: boolean
    rot_ok?: boolean
  }

  /** Coarse device hints; optional to preserve anonymity */
  platform?: 'ios' | 'android' | 'web'
  device_model?: string
}

export type Session = {
  session_id: string
  started_at_ms: number
  ended_at_ms: number
  samples: Sample[]
}
