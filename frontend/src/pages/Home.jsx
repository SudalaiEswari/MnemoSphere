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

  if (token) {
    return (
      <div className="hero">
        <div className="hero-badge">✨ Welcome back</div>
        <h1>Your Memory<br/>Assistant</h1>
        <p>MnemoSphere is ready. Head to your dashboard to review notes, check tasks, or chat with your AI assistant.</p>
        <a href="/dashboard" className="btn btn-primary btn-lg">Go to Dashboard →</a>
        <div className="features">
          <div className="feature-card"><span className="icon">📝</span><h3>Notes</h3><p>Capture ideas with AI categorization</p></div>
          <div className="feature-card"><span className="icon">🔄</span><h3>1-3-7 Review</h3><p>Spaced repetition for long-term memory</p></div>
          <div className="feature-card"><span className="icon">🎯</span><h3>Goals & Habits</h3><p>Track progress and build routines</p></div>
        </div>
      </div>
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const url = isLogin ? '/api/auth/login' : '/api/auth/register'
      const body = isLogin ? { email, password } : { email, password, name }
      const { data } = await axios.post(url, body)
      localStorage.setItem('token', data.access_token)
      localStorage.setItem('userId', data.user_id)
      setToken(data.access_token)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.detail || 'Something went wrong')
    }
  }

  return (
    <div>
      <div className="hero">
        <div className="hero-badge">🧠 AI-Powered Memory</div>
        <h1>MnemoSphere</h1>
        <p>Never forget what matters. AI-powered notes, 1-3-7 spaced repetition, smart search, and your personal memory assistant.</p>
      </div>
      <div className="auth-form">
        <h2>{isLogin ? 'Welcome Back' : 'Get Started'}</h2>
        <p className="subtitle">{isLogin ? 'Sign in to your memory sphere' : 'Create your memory sphere'}</p>
        {error && <div style={{ padding: '0.75rem', background: 'rgba(239,71,111,0.1)', borderRadius: 'var(--radius-sm)', color: 'var(--danger)', fontSize: '0.85rem', marginBottom: '1rem' }}>{error}</div>}
        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div>
              <label>Name</label>
              <input placeholder="Your name" value={name} onChange={e => setName(e.target.value)} required />
            </div>
          )}
          <div>
            <label>Email</label>
            <input type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div>
            <label>Password</label>
            <input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem' }}>
            {isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </form>
        <p style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button className="btn btn-secondary btn-sm" onClick={() => setIsLogin(!isLogin)} style={{ display: 'inline-flex', marginLeft: '0.25rem' }}>
            {isLogin ? 'Sign Up' : 'Sign In'}
          </button>
        </p>
      </div>
      <div className="features" style={{ maxWidth: '800px', margin: '2rem auto', padding: '0 1rem' }}>
        <div className="feature-card"><span className="icon">🧠</span><h3>Smart Memory</h3><p>1-3-7 spaced repetition optimizes recall</p></div>
        <div className="feature-card"><span className="icon">🤖</span><h3>AI Assistant</h3><p>Chat with your notes, get summaries, quizzes</p></div>
        <div className="feature-card"><span className="icon">📊</span><h3>Analytics</h3><p>Track memory scores, topics, and streaks</p></div>
        <div className="feature-card"><span className="icon">🎯</span><h3>Goals & Habits</h3><p>Set goals, build habits, stay on track</p></div>
        <div className="feature-card"><span className="icon">🔍</span><h3>Smart Search</h3><p>Find anything with vector search</p></div>
        <div className="feature-card"><span className="icon">📎</span><h3>File Upload</h3><p>Images, docs, auto-extracted text</p></div>
      </div>
    </div>
  )
}