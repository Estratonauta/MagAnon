import { Link, Route, Routes } from 'react-router-dom'
import Survey from './pages/Survey'
import Map from './pages/Map'

export default function App() {
  return (
    <div>
      <nav style={{ padding: 12, borderBottom: '1px solid #eee' }}>
        <Link to="/" style={{ marginRight: 12 }}>Survey</Link>
        <Link to="/map">Map</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Survey />} />
        <Route path="/map" element={<Map />} />
      </Routes>
    </div>
  )
}
