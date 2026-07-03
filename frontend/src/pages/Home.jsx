import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const API = (url, data) => axios.post(`/api${url}`, data, {
  headers: { 'Content-Type': 'application/json' }
}).then(r => r.data)

export default function Home({ token, setToken }) {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const data = isLogin
        ? await API('/auth/login', { email, password })
        : await API('/auth/register', { email, password, name })
      localStorage.setItem('token', data.access_token)
      localStorage.setItem('userId', data.user_id)
      setToken(data.access_token)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.detail || 'Something went wrong')
    }
  }

  if (token) {
    navigate('/dashboard')
    return null
  }

  return (
    <div>
      <div className="hero">
        <h1>MnemoSphere</h1>
        <p>Your AI-powered memory assistant. Upload notes, get AI summaries, and review using the 1-3-7 spaced repetition method to never forget what matters.</p>
      </div>
      <div className="features">
        <div className="card feature-card">
          <div className="icon">📝</div>
          <h3>Smart Notes</h3>
          <p>Upload text, PDFs, voice transcripts, or images. AI extracts and organizes key information.</p>
        </div>
        <div className="card feature-card">
          <div className="icon">🤖</div>
          <h3>AI Quiz Generator</h3>
          <p>Generate personalized quizzes from your notes. Active recall strengthens memory retention.</p>
        </div>
        <div className="card feature-card">
          <div className="icon">📅</div>
          <h3>1-3-7 Review</h3>
          <p>Automatically reminded to review after 1, 3, and 7 days. Scientifically proven spaced repetition.</p>
        </div>
        <div className="card feature-card">
          <div className="icon">📊</div>
          <h3>Memory Analytics</h3>
          <p>Track your memory score, topic mastery, revision history, and personalized recommendations.</p>
        </div>
      </div>
      <div className="auth-form card">
        <h2>{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
        {error && <p style={{ color: 'var(--danger)', marginBottom: '1rem' }}>{error}</p>}
        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <input type="text" placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} required />
          )}
          <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
          <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
            {isLogin ? 'Sign In' : 'Register'}
          </button>
        </form>
        <p style={{ textAlign: 'center', marginTop: '1rem', color: 'var(--text-light)' }}>
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button className="btn btn-outline" onClick={() => setIsLogin(!isLogin)} style={{ marginLeft: '0.5rem' }}>
            {isLogin ? 'Register' : 'Sign In'}
          </button>
        </p>
      </div>
    </div>
  )
}
