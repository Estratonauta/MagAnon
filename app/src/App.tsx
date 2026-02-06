import { Link, Route, Routes } from 'react-router-dom'
import Survey from './pages/Survey'
import Map from './pages/Map'
import Record from './pages/Record'
import Settings from './pages/Settings'

export default function App() {
  return (
    <div>
      <nav style={{ padding: 12, borderBottom: '1px solid #eee', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <Link to="/record">Record</Link>
        <Link to="/settings">Settings</Link>
        <Link to="/map">Map</Link>
        <Link to="/">Survey (legacy)</Link>
      </nav>
      <Routes>
        <Route path="/record" element={<Record />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/map" element={<Map />} />
        <Route path="/" element={<Survey />} />
      </Routes>
    </div>
  )
}
