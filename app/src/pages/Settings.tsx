import { useEffect, useState } from 'react'
import {
  defaultRecordingSettings,
  loadRecordingSettings,
  saveRecordingSettings,
  type RecordingSettings,
} from '../lib/settings'

export default function Settings() {
  const [s, setS] = useState<RecordingSettings>(defaultRecordingSettings)

  useEffect(() => {
    setS(loadRecordingSettings())
  }, [])

  useEffect(() => {
    saveRecordingSettings(s)
  }, [s])

  return (
    <div style={{ padding: 16, maxWidth: 720 }}>
      <h1>Settings</h1>

      <h2>Recording</h2>
      <label style={{ display: 'block', marginBottom: 12 }}>
        <input
          type="checkbox"
          checked={s.background}
          onChange={(e) => setS({ ...s, background: e.target.checked })}
        />{' '}
        Background recording (Android foreground service)
      </label>

      <label style={{ display: 'block', marginBottom: 12 }}>
        Sample rate (Hz):{' '}
        <input
          type="number"
          min={1}
          max={50}
          value={s.sampleHz}
          onChange={(e) => setS({ ...s, sampleHz: Number(e.target.value) })}
          style={{ width: 80 }}
        />
      </label>

      <label style={{ display: 'block', marginBottom: 12 }}>
        Min GPS accuracy (m):{' '}
        <input
          type="number"
          min={1}
          max={500}
          value={s.minAccuracyM}
          onChange={(e) => setS({ ...s, minAccuracyM: Number(e.target.value) })}
          style={{ width: 100 }}
        />
      </label>

      <p style={{ color: '#555' }}>
        Note: On Android 13+ you must grant notification permission to allow the background recording
        notification.
      </p>
    </div>
  )
}
