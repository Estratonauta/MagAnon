import { useEffect, useMemo, useState } from 'react'
import ExportPicker from '../components/ExportPicker'
import { makeMockSession } from '../lib/mockSession'
import type { Session } from '../lib/schema'

const STORAGE_KEY = 'maganon:lastSession'

function loadSavedSession(): Session | null {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as Session
  } catch {
    return null
  }
}

function saveSession(session: Session) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
}

export default function Survey() {
  const [session, setSession] = useState<Session | null>(null)
  const [optInUpload, setOptInUpload] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<string>('')

  useEffect(() => {
    const saved = loadSavedSession()
    if (saved) {
      setSession(saved)
      return
    }
    const s = makeMockSession()
    saveSession(s)
    setSession(s)
  }, [])

  const sampleCount = useMemo(() => session?.samples.length ?? 0, [session])

  async function upload() {
    if (!session) return
    if (!optInUpload) {
      setUploadStatus('Upload requires opt-in (ODbL).')
      return
    }
    setUploadStatus('Uploading…')
    try {
      const res = await fetch('http://localhost:8787/api/samples', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          opt_in: true,
          samples: session.samples,
          client: { app: 'maganon-web', version: '0.0.0' },
        }),
      })
      const json = await res.json()
      if (!res.ok) {
        setUploadStatus(`Upload failed: ${json?.error ?? res.status}`)
        return
      }
      setUploadStatus(`Uploaded ${json.accepted} samples (stored: ${json.stored_samples}).`)
    } catch (e) {
      setUploadStatus(`Upload failed: ${String(e)}`)
    }
  }

  return (
    <div style={{ padding: 16, maxWidth: 820 }}>
      <h1>MagAnon</h1>
      <p>Anonymous, crowd-sourced magnetic field + location mapping (iOS-first).</p>
      <p style={{ color: '#555' }}>
        Note: Safari web apps on iOS don’t reliably expose raw magnetometer data. The iOS app wrapper
        (Capacitor) will provide the real sensor bridge.
      </p>

      <h2>Live Survey (stub)</h2>
      <ul>
        <li>Location: pending</li>
        <li>Heading: pending</li>
        <li>Mag field (µT): pending</li>
        <li>Sampling: 1 Hz (configurable)</li>
      </ul>

      <button disabled>Start</button>
      <button disabled style={{ marginLeft: 8 }}>
        Stop
      </button>

      <h2 style={{ marginTop: 24 }}>Saved session (mock)</h2>
      {!session ? (
        <div>Loading…</div>
      ) : (
        <>
          <div style={{ color: '#555', marginBottom: 8 }}>
            session_id: <code>{session.session_id}</code> • {sampleCount} samples
          </div>
          <ExportPicker session={session} />

          <h3 style={{ marginTop: 16 }}>Opt-in upload (stub)</h3>
          <label style={{ display: 'block', marginBottom: 8 }}>
            <input type="checkbox" checked={optInUpload} onChange={(e) => setOptInUpload(e.target.checked)} />{' '}
            I agree to contribute this session to the public data pool under ODbL (opt-in).
          </label>
          <button onClick={upload} disabled={!optInUpload}>
            Upload to public pool
          </button>
          {uploadStatus ? <div style={{ marginTop: 8, color: '#555' }}>{uploadStatus}</div> : null}
        </>
      )}

      <h3 style={{ marginTop: 24 }}>Privacy</h3>
      <p>No accounts. Rotating session IDs. Upload is opt-in.</p>
    </div>
  )
}
