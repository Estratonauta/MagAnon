export default function Survey() {
  return (
    <div style={{ padding: 16, maxWidth: 820 }}>
      <h1>MagAnon</h1>
      <p>
        Anonymous, crowd-sourced magnetic field + location mapping (iOS-first).
      </p>
      <p style={{ color: '#555' }}>
        Note: Safari web apps on iOS don’t reliably expose raw magnetometer data.
        The iOS app wrapper (Capacitor) will provide the real sensor bridge.
      </p>

      <h2>Live Survey (stub)</h2>
      <ul>
        <li>Location: pending</li>
        <li>Heading: pending</li>
        <li>Mag field (µT): pending</li>
        <li>Sampling: 1 Hz (configurable)</li>
      </ul>

      <button disabled>Start</button>
      <button disabled style={{ marginLeft: 8 }}>Stop</button>

      <h3>Privacy</h3>
      <p>No accounts. Rotating session IDs. Upload will be opt-in.</p>
    </div>
  )
}
