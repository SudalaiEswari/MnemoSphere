import { Routes, Route, Link, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import InstallPrompt from './components/InstallPrompt'
import Notes from './pages/Notes'
import Review from './pages/Review'
import Analytics from './pages/Analytics'
import Assistant from './pages/Assistant'
import Tasks from './pages/Tasks'
import Timeline from './pages/Timeline'
import Goals from './pages/Goals'
import Habits from './pages/Habits'
import Summary from './pages/Summary'

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [menuOpen, setMenuOpen] = useState(false)
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('userId')
    setToken(null)
    navigate('/')
  }

  useEffect(() => {
    const t = localStorage.getItem('token')
    if (t) setToken(t)
  }, [])

  return (
    <div className="app">
      <nav className="navbar">
        <div className="nav-left">
          <button className="nav-toggle" onClick={() => setMenuOpen(!menuOpen)}>☰</button>
          <div className="nav-brand">
            <Link to="/">🧠 MnemoSphere</Link>
          </div>
        </div>
        <div className={`nav-links ${menuOpen ? 'open' : ''}`}>
          {token ? (
            <>
              <Link to="/dashboard" onClick={() => setMenuOpen(false)}>Dashboard</Link>
              <Link to="/notes" onClick={() => setMenuOpen(false)}>Notes</Link>
              <Link to="/review" onClick={() => setMenuOpen(false)}>Review</Link>
              <Link to="/timeline" onClick={() => setMenuOpen(false)}>Timeline</Link>
              <Link to="/goals" onClick={() => setMenuOpen(false)}>Goals</Link>
              <Link to="/habits" onClick={() => setMenuOpen(false)}>Habits</Link>
              <Link to="/summary" onClick={() => setMenuOpen(false)}>Summary</Link>
              <Link to="/analytics" onClick={() => setMenuOpen(false)}>Analytics</Link>
              <Link to="/tasks" onClick={() => setMenuOpen(false)}>Tasks</Link>
              <Link to="/assistant" onClick={() => setMenuOpen(false)}>AI</Link>
              <button className="btn btn-outline" onClick={() => { handleLogout(); setMenuOpen(false) }}>Logout</button>
            </>
          ) : (
            <Link to="/" className="btn btn-primary" onClick={() => setMenuOpen(false)}>Login</Link>
          )}
        </div>
      </nav>
      <InstallPrompt />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home token={token} setToken={setToken} />} />
          <Route path="/dashboard" element={<Dashboard token={token} />} />
          <Route path="/notes" element={<Notes token={token} />} />
          <Route path="/review" element={<Review token={token} />} />
          <Route path="/analytics" element={<Analytics token={token} />} />
          <Route path="/tasks" element={<Tasks token={token} />} />
          <Route path="/assistant" element={<Assistant token={token} />} />
          <Route path="/timeline" element={<Timeline token={token} />} />
          <Route path="/goals" element={<Goals token={token} />} />
          <Route path="/habits" element={<Habits token={token} />} />
          <Route path="/summary" element={<Summary token={token} />} />
        </Routes>
      </main>
    </div>
  )
}

export default App