import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export default function Dashboard({ token }) {
  const [data, setData] = useState(null)
  const [agent, setAgent] = useState(null)
  const [showAllWeak, setShowAllWeak] = useState(false)

  useEffect(() => {
    if (!token) return
    axios.get('/api/analytics/dashboard', { params: { token } }).then(r => setData(r.data))
    axios.get('/api/agent/today', { params: { token } }).then(r => setAgent(r.data))
    const handler = () => window.dispatchEvent(new CustomEvent('openguide'))
    const el = document.querySelector('.guide-banner')
    if (el) el.addEventListener('click', handler)
    return () => { if (el) el.removeEventListener('click', handler) }
  }, [token])

  if (!data) return <div className="loading">Loading dashboard...</div>

  const maxWeekly = Math.max(1, ...Object.values(data.weekly_progress?.daily_reviews || {}))
  const weekDays = DAYS.map(d => ({
    day: d,
    count: data.weekly_progress?.daily_reviews?.[d] || 0,
  }))

  return (
    <div>
      <div className="page-header">
        <h1>🧠 Memory Twin Dashboard</h1>
        <p>Your personal AI knows what you know</p>
      </div>

      {/* Guide Banner */}
      <div className="guide-banner" onClick={() => window.dispatchEvent(new CustomEvent('openguide'))}>
        <span>🆕</span>
        <span style={{ flex: 1 }}><strong>How MnemoSphere works</strong> — notes → review → memory strength, reminders, and more</span>
        <span className="btn btn-primary btn-xs">Open Guide</span>
      </div>

      {/* Stats Grid */}
      <div className="grid">
        <div className="card stat-card">
          <h3>{data.total_notes}</h3>
          <p>Total Notes</p>
        </div>
        <div className="card stat-card">
          <h3>{data.total_reviews}</h3>
          <p>Reviews Done</p>
        </div>
        <div className="card stat-card">
          <h3 style={{ background: 'var(--gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            {data.memory_score}%
          </h3>
          <p>Memory Score</p>
        </div>
        <div className="card stat-card">
          <h3>{data.streak_days}</h3>
          <p>Day Streak 🔥</p>
        </div>
        <div className="card stat-card">
          <h3 style={{ color: data.reviews_due > 0 ? 'var(--warning)' : 'var(--success)' }}>
            {data.reviews_due}
          </h3>
          <p>Reviews Due</p>
        </div>
        <div className="card stat-card">
          <h3>{data.weekly_progress?.total || 0}</h3>
          <p>Reviews This Week</p>
        </div>
      </div>

      {/* Agent Plan Card */}
      {agent && (
        <div className="card" style={{ marginTop: '1.5rem', borderLeft: '3px solid var(--secondary)', background: 'rgba(0, 212, 170, 0.04)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <h3 style={{ fontSize: '1rem' }}>🤖 AI Agent — Today's Plan</h3>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Link to="/assistant" className="btn btn-primary btn-sm">Chat with AI</Link>
              <Link to="/review" className="btn btn-secondary btn-sm">Review</Link>
            </div>
          </div>
          {agent.reviews_due > 0 && (
            <p style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>
              ⏰ <strong>{agent.reviews_due}</strong> notes due for review
            </p>
          )}
          <pre style={{
            whiteSpace: 'pre-wrap', fontSize: '0.85rem', color: 'var(--text-muted)',
            background: 'rgba(0,0,0,0.2)', padding: '0.75rem', borderRadius: '8px',
            lineHeight: '1.5',
          }}>{agent.recommendations}</pre>
          {agent.ai_advice && (
            <div style={{ marginTop: '0.75rem', padding: '0.75rem', background: 'rgba(124, 92, 252, 0.08)', borderRadius: '8px', fontSize: '0.85rem' }}>
              <p style={{ fontWeight: 600, marginBottom: '0.25rem', color: 'var(--primary)' }}>💡 AI Advice</p>
              <p style={{ color: 'var(--text-muted)', whiteSpace: 'pre-wrap' }}>{agent.ai_advice}</p>
            </div>
          )}
        </div>
      )}

      {/* Weekly Progress Bar Chart */}
      <div className="card" style={{ marginTop: '1.5rem' }}>
        <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>📊 Weekly Reviews</h3>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem', height: '120px' }}>
          {weekDays.map(w => (
            <div key={w.day} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginBottom: '0.25rem' }}>{w.count}</span>
              <div style={{
                width: '100%', maxWidth: '36px',
                height: `${Math.max(4, (w.count / maxWeekly) * 100)}%`,
                background: w.count > 0 ? 'var(--gradient)' : 'rgba(255,255,255,0.06)',
                borderRadius: '6px 6px 2px 2px',
                transition: 'height 0.5s ease',
                minHeight: w.count > 0 ? '8px' : '4px',
              }} />
              <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: '0.3rem' }}>{w.day}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid" style={{ marginTop: '1.5rem' }}>
        {/* Topic Strength */}
        <div className="card">
          <h3 style={{ fontSize: '1rem', marginBottom: '0.75rem' }}>🏆 Memory Strength by Topic</h3>
          {Object.keys(data.topic_strengths || {}).length === 0 ? (
            <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>No topics yet — add notes to see memory strength</p>
          ) : (
            Object.entries(data.topic_strengths || {})
              .sort((a, b) => b[1] - a[1])
              .slice(0, showAllWeak ? 99 : 6)
              .map(([topic, score]) => (
                <div key={topic} style={{ marginBottom: '0.6rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.2rem' }}>
                    <span>{topic}</span>
                    <span style={{
                      color: score >= 70 ? 'var(--success)' : score >= 40 ? 'var(--warning)' : 'var(--danger)',
                      fontWeight: 600,
                    }}>{score}%</span>
                  </div>
                  <div className="progress-fill-bg">
                    <div className="progress-fill" style={{
                      width: `${score}%`,
                      background: score >= 70 ? 'var(--success)' : score >= 40 ? 'var(--warning)' : 'var(--danger)',
                    }} />
                  </div>
                </div>
              ))
          )}
          {Object.keys(data.topic_strengths || {}).length > 6 && (
            <button className="btn btn-secondary btn-sm" style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem' }}
              onClick={() => setShowAllWeak(!showAllWeak)}>
              {showAllWeak ? 'Show Less' : `Show All (${Object.keys(data.topic_strengths).length} topics)`}
            </button>
          )}
        </div>

        {/* Weakest & Forgotten */}
        <div>
          {/* Weakest Topics */}
          {data.weakest_topics?.length > 0 && (
            <div className="card" style={{ marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1rem', marginBottom: '0.75rem' }}>⚠️ Needs Attention</h3>
              {data.weakest_topics.slice(0, 4).map(w => (
                <div key={w.topic} style={{
                  padding: '0.5rem 0', borderBottom: '1px solid rgba(255,255,255,0.04)',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                  <span style={{ fontSize: '0.85rem' }}>{w.topic}</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--danger)', fontWeight: 600 }}>{w.score}%</span>
                </div>
              ))}
            </div>
          )}

          {/* Forgotten Notes */}
          {data.forgotten_notes?.length > 0 && (
            <div className="card" style={{ marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1rem', marginBottom: '0.75rem' }}>🔄 Keep Forgetting</h3>
              {data.forgotten_notes.slice(0, 3).map(f => (
                <div key={f.id} style={{
                  padding: '0.5rem 0', borderBottom: '1px solid rgba(255,255,255,0.04)',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                  <span style={{ fontSize: '0.85rem' }}>{f.title}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Failed {f.fails}x</span>
                </div>
              ))}
              <Link to="/review" className="btn btn-primary btn-sm" style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem' }}>
                Review Weak Spots
              </Link>
            </div>
          )}

          {/* Due Reviews */}
          {data.reviews_due > 0 && (
            <div className="card">
              <h3 style={{ fontSize: '1rem', marginBottom: '0.75rem' }}>⏰ Due Today</h3>
              <p style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--warning)' }}>{data.reviews_due}</p>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>reviews waiting</p>
              <Link to="/review" className="btn btn-primary btn-sm" style={{ width: '100%', justifyContent: 'center', marginTop: '0.75rem' }}>
                Start Review
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card" style={{ marginTop: '1.5rem' }}>
        <h3 style={{ fontSize: '1rem', marginBottom: '0.75rem' }}>⚡ Quick Actions</h3>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <Link to="/notes" className="btn btn-primary btn-sm">📝 New Note</Link>
          <Link to="/assistant" className="btn btn-secondary btn-sm">🤖 Memory Twin AI</Link>
          <Link to="/review" className="btn btn-secondary btn-sm">🎯 Auto Quiz</Link>
          <Link to="/goals" className="btn btn-secondary btn-sm">🎯 Goals</Link>
          <Link to="/habits" className="btn btn-secondary btn-sm">✅ Habits</Link>
          <Link to="/timeline" className="btn btn-secondary btn-sm">📅 Timeline</Link>
        </div>
      </div>

      {/* Feature Connections */}
      <div className="card" style={{ marginTop: '1.5rem' }}>
        <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>🔗 How Everything Connects</h3>
        <div className="flow-grid">
          <div className="flow-node">
            <div className="flow-icon">📝</div>
            <div className="flow-label">Notes</div>
            <div className="flow-desc">Add text, images, or voice</div>
          </div>
          <div className="flow-arrow">→</div>
          <div className="flow-node">
            <div className="flow-icon">🔄</div>
            <div className="flow-label">Review</div>
            <div className="flow-desc">AI quizzes on 1-3-7 schedule</div>
          </div>
          <div className="flow-arrow">→</div>
          <div className="flow-node">
            <div className="flow-icon">🧠</div>
            <div className="flow-label">Memory Strength</div>
            <div className="flow-desc">Scores grow as you review</div>
          </div>
        </div>
        <div className="flow-note">
          <strong>Standalone features:</strong> Tasks, Habits, Goals — track these independently. They appear in your Timeline and AI can give advice about them.
        </div>
        <div className="flow-note" style={{ marginTop: '0.5rem' }}>
          <strong>🔔 Reminders:</strong> Enable browser notifications to get alerts for due reviews, overdue tasks, and pending habit check-ins. 
          Open the <strong>Guide</strong> (❓ button) to learn more.
        </div>
      </div>
    </div>
  )
}
