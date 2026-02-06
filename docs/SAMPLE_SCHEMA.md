# Canonical sample schema (v0)

MagAnon uploads data as **bulk samples** grouped by a `session_id`.

The canonical payload is intentionally small and boring: a time + location + optional magnetic readings.

## Sample (TypeScript)

```ts
export type Sample = {
  session_id: string
  ts_ms: number
  lat: number
  lon: number

  // optional
  accuracy_m?: number
  altitude_m?: number
  heading_deg?: number

  // magnetic data
  magnetic_uT?: number
  magnetic_vec_uT?: { x: number; y: number; z: number }

  // basic QC flags (optional)
  qc?: {
    gps_ok?: boolean
    mag_ok?: boolean
    rot_ok?: boolean
  }

  // coarse device hints (optional)
  platform?: 'ios' | 'android' | 'web'
  device_model?: string
}
```

## Sample (JSON example)

```json
{
  "session_id": "sess_abc123_1738850000000",
  "ts_ms": 1738850000123,
  "lat": -23.561,
  "lon": -46.655,
  "accuracy_m": 8,
  "heading_deg": 91.2,
  "magnetic_uT": 35.4,
  "magnetic_vec_uT": { "x": 10.1, "y": 5.0, "z": 42.3 },
  "qc": { "gps_ok": true, "mag_ok": true, "rot_ok": true },
  "platform": "android"
}
```

## Validation rules (server stub)

- `session_id`: string, length ≥ 8
- `ts_ms`: positive number
- `lat`: number in [-90, 90]
- `lon`: number in [-180, 180]
- `accuracy_m`: number ≥ 0 (optional)
- `heading_deg`: number in [0, 360) (optional)

The server currently rejects the whole batch if any sample fails validation.
