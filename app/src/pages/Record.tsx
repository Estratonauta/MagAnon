import { useEffect, useMemo, useState } from 'react'
import { Sensors, type RecorderStatus } from '../bridge/sensors'
import { loadRecordingSettings } from '../lib/settings'

export default function Record() {
  const [status, setStatus] = useState<RecorderStatus | null>(null)
  const [err, setErr] = useState<string>('')

  const available = Sensors.isAvailable()

  async function refresh() {
    try {
      setStatus(await Sensors.getStatus())
    } catch (e) {
      setErr(String(e))
    }
  }

  useEffect(() => {
    refresh()
    const t = window.setInterval(refresh, 1000)
    return () => window.clearInterval(t)
  }, [])

  const recording = Boolean(status?.recording)

  const gpsText = useMemo(() => {
    const a = status?.lastAccuracyM
    if (a == null) return '—'
    return `${a.toFixed(1)} m`
  }, [status?.lastAccuracyM])

  async function start() {
    setErr('')
    const s = loadRecordingSettings()
    try {
      await Sensors.startRecording({
        background: s.background,
        sampleHz: s.sampleHz,
        minAccuracyM: s.minAccuracyM,
      })
      await refresh()
    } catch (e) {
      setErr(String(e))
    }
  }

  async function stop() {
    setErr('')
    try {
      await Sensors.stopRecording()
      await refresh()
    } catch (e) {
      setErr(String(e))
    }
  }

  return (
    <div style={{ padding: 16, maxWidth: 820 }}>
      <h1>Record</h1>
      <p style={{ color: '#555' }}>
        Android-first on-device collection (Pixel 9 target). Background mode uses a foreground
        service + persistent notification.
      </p>

      {!available ? (
        <div style={{ padding: 12, background: '#fff7e6', border: '1px solid #ffe0a3', borderRadius: 8 }}>
          Running in web mode (mock). Install the Android build to collect real magnetometer + GPS.
        </div>
      ) : null}

      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        <button onClick={start} disabled={recording}>
          Start
        </button>
        <button onClick={stop} disabled={!recording}>
          Stop
        </button>
      </div>

      <h2 style={{ marginTop: 16 }}>Status</h2>
      <ul>
        <li>
          Recording: <b>{recording ? 'yes' : 'no'}</b>
        </li>
        <li>
          Background: <b>{status?.background ? 'yes' : 'no'}</b>
        </li>
        <li>
          Session ID: <code>{status?.sessionId ?? '—'}</code>
        </li>
        <li>
          Samples: <b>{status?.sampleCount ?? 0}</b>
        </li>
        <li>
          GPS accuracy: <b>{gpsText}</b>
        </li>
      </ul>

      {err ? <div style={{ color: 'crimson' }}>{err}</div> : null}
    </div>
  )
}
