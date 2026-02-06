import type { Session } from './schema'

export type ExportFormat = 'json' | 'csv' | 'geojson'

export function exportSession(session: Session, format: ExportFormat): { filename: string; mime: string; data: string } {
  switch (format) {
    case 'json': {
      const data = JSON.stringify(session, null, 2)
      return { filename: `maganon_${session.session_id}.json`, mime: 'application/json', data }
    }
    case 'csv': {
      const header = [
        'session_id',
        'ts_ms',
        'lat',
        'lon',
        'accuracy_m',
        'altitude_m',
        'heading_deg',
        'magnetic_uT',
        'magnetic_vec_x_uT',
        'magnetic_vec_y_uT',
        'magnetic_vec_z_uT',
        'platform',
      ]
      const rows = session.samples.map((s) => [
        s.session_id,
        s.ts_ms,
        s.lat,
        s.lon,
        s.accuracy_m ?? '',
        s.altitude_m ?? '',
        s.heading_deg ?? '',
        s.magnetic_uT ?? '',
        s.magnetic_vec_uT?.x ?? '',
        s.magnetic_vec_uT?.y ?? '',
        s.magnetic_vec_uT?.z ?? '',
        s.platform ?? '',
      ])
      const data = [header, ...rows].map((r) => r.map(csvCell).join(',')).join('\n') + '\n'
      return { filename: `maganon_${session.session_id}.csv`, mime: 'text/csv', data }
    }
    case 'geojson': {
      const fc = {
        type: 'FeatureCollection',
        features: session.samples.map((s) => ({
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [s.lon, s.lat],
          },
          properties: {
            session_id: s.session_id,
            ts_ms: s.ts_ms,
            accuracy_m: s.accuracy_m ?? null,
            altitude_m: s.altitude_m ?? null,
            heading_deg: s.heading_deg ?? null,
            magnetic_uT: s.magnetic_uT ?? null,
            magnetic_vec_uT: s.magnetic_vec_uT ?? null,
            platform: s.platform ?? null,
          },
        })),
      }
      const data = JSON.stringify(fc, null, 2)
      return { filename: `maganon_${session.session_id}.geojson`, mime: 'application/geo+json', data }
    }
  }
}

function csvCell(v: unknown): string {
  if (v == null) return ''
  const s = String(v)
  if (/[\n",]/.test(s)) return `"${s.replaceAll('"', '""')}"`
  return s
}

export function downloadTextFile(filename: string, mime: string, data: string) {
  const blob = new Blob([data], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}
