import express from 'express'
import cors from 'cors'

const app = express()
app.use(cors())
app.use(express.json({ limit: '2mb' }))

/** In-memory store of accepted samples (stub). */
const store = {
  batches: [],
  samples: [],
}

function isFiniteNumber(x) {
  return typeof x === 'number' && Number.isFinite(x)
}

function validateSample(s) {
  const errors = []
  if (typeof s !== 'object' || s == null) return { ok: false, errors: ['sample must be an object'] }

  // required
  if (typeof s.session_id !== 'string' || s.session_id.length < 8) errors.push('session_id: string (min 8)')
  if (!isFiniteNumber(s.ts_ms) || s.ts_ms <= 0) errors.push('ts_ms: positive number')
  if (!isFiniteNumber(s.lat) || s.lat < -90 || s.lat > 90) errors.push('lat: number in [-90,90]')
  if (!isFiniteNumber(s.lon) || s.lon < -180 || s.lon > 180) errors.push('lon: number in [-180,180]')

  // optional
  if (s.accuracy_m != null && (!isFiniteNumber(s.accuracy_m) || s.accuracy_m < 0)) errors.push('accuracy_m: number >= 0 (optional)')
  if (s.altitude_m != null && !isFiniteNumber(s.altitude_m)) errors.push('altitude_m: number (optional)')
  if (s.heading_deg != null && (!isFiniteNumber(s.heading_deg) || s.heading_deg < 0 || s.heading_deg >= 360)) errors.push('heading_deg: number in [0,360) (optional)')
  if (s.magnetic_uT != null && !isFiniteNumber(s.magnetic_uT)) errors.push('magnetic_uT: number (optional)')
  if (s.magnetic_vec_uT != null) {
    const v = s.magnetic_vec_uT
    if (typeof v !== 'object' || v == null) errors.push('magnetic_vec_uT: {x,y,z} (optional)')
    else {
      if (!isFiniteNumber(v.x) || !isFiniteNumber(v.y) || !isFiniteNumber(v.z)) errors.push('magnetic_vec_uT: {x,y,z} numbers')
    }
  }

  return { ok: errors.length === 0, errors }
}

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, stored_samples: store.samples.length })
})

// Bulk ingestion stub.
// Body: { samples: Sample[], opt_in: boolean, client?: {...} }
app.post('/api/samples', (req, res) => {
  const body = req.body
  if (typeof body !== 'object' || body == null) return res.status(400).json({ ok: false, error: 'json body required' })

  if (body.opt_in !== true) {
    return res.status(400).json({ ok: false, error: 'opt_in must be true (ODbL contribution is opt-in)' })
  }

  if (!Array.isArray(body.samples) || body.samples.length === 0) {
    return res.status(400).json({ ok: false, error: 'samples must be a non-empty array' })
  }
  if (body.samples.length > 10_000) {
    return res.status(413).json({ ok: false, error: 'too many samples (max 10k per request)' })
  }

  const errors = []
  const accepted = []
  for (let i = 0; i < body.samples.length; i++) {
    const v = validateSample(body.samples[i])
    if (!v.ok) {
      errors.push({ index: i, errors: v.errors })
    } else {
      accepted.push(body.samples[i])
    }
  }

  if (errors.length) {
    return res.status(400).json({ ok: false, error: 'validation_failed', errors })
  }

  store.batches.push({
    received_at_ms: Date.now(),
    count: accepted.length,
    session_id: accepted[0].session_id,
    client: body.client ?? null,
  })
  store.samples.push(...accepted)

  res.json({ ok: true, accepted: accepted.length, stored_samples: store.samples.length })
})

const port = process.env.PORT ? Number(process.env.PORT) : 8787
app.listen(port, () => {
  console.log(`[maganon-server] listening on http://localhost:${port}`)
})
