import { Routes, Route, Link, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import Notes from './pages/Notes'
import Review from './pages/Review'
import Analytics from './pages/Analytics'
import Assistant from './pages/Assistant'
import Tasks from './pages/Tasks'

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'))
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
        <div className="nav-brand">
          <Link to="/">🧠 MnemoSphere</Link>
        </div>
        <div className="nav-links">
          {token ? (
            <>
              <Link to="/dashboard">Dashboard</Link>
              <Link to="/notes">Notes</Link>
              <Link to="/review">Review</Link>
              <Link to="/analytics">Analytics</Link>
              <Link to="/tasks">Tasks</Link>
              <Link to="/assistant">AI Assistant</Link>
              <button className="btn btn-outline" onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <Link to="/" className="btn btn-primary">Login</Link>
          )}
        </div>
      </nav>
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home token={token} setToken={setToken} />} />
          <Route path="/dashboard" element={<Dashboard token={token} />} />
          <Route path="/notes" element={<Notes token={token} />} />
          <Route path="/review" element={<Review token={token} />} />
          <Route path="/analytics" element={<Analytics token={token} />} />
          <Route path="/tasks" element={<Tasks token={token} />} />
          <Route path="/assistant" element={<Assistant token={token} />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
