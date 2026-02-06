import { useMemo, useState } from 'react'
import type { Session } from '../lib/schema'
import { downloadTextFile, exportSession, type ExportFormat } from '../lib/exporters'

export default function ExportPicker({ session }: { session: Session }) {
  const [format, setFormat] = useState<ExportFormat>('json')

  const info = useMemo(() => exportSession(session, format), [session, format])

  return (
    <div style={{ border: '1px solid #eee', padding: 12, borderRadius: 8 }}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        <label>
          Export as:{' '}
          <select value={format} onChange={(e) => setFormat(e.target.value as ExportFormat)}>
            <option value="json">JSON (session)</option>
            <option value="csv">CSV (samples)</option>
            <option value="geojson">GeoJSON (FeatureCollection)</option>
          </select>
        </label>
        <button onClick={() => downloadTextFile(info.filename, info.mime, info.data)}>Download</button>
      </div>
      <div style={{ marginTop: 8, color: '#555', fontSize: 12 }}>
        Generates a file from the currently saved session (mock data for now).
      </div>
    </div>
  )
}
