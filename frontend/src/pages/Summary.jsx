import { useState, useEffect } from 'react'
import axios from 'axios'

export default function Summary({ token }) {
  const [daily, setDaily] = useState(null)
  const [weekly, setWeekly] = useState(null)
  const [tab, setTab] = useState('daily')

  useEffect(() => {
    if (!token) return
    axios.get('/api/summary/daily', { params: { token } }).then(r => setDaily(r.data))
    axios.get('/api/summary/weekly', { params: { token } }).then(r => setWeekly(r.data))
  }, [token])

  if (!daily && !weekly) return <div className="loading">Loading summary...</div>

  return (
    <div>
      <h1 style={{ marginBottom: '1.5rem' }}>Summary 📊</h1>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        <button className={`btn ${tab === 'daily' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setTab('daily')}>Daily</button>
        <button className={`btn ${tab === 'weekly' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setTab('weekly')}>Weekly</button>
      </div>

      {tab === 'daily' && daily && (
        <div>
          <div className="grid" style={{ marginBottom: '1.5rem' }}>
            <div className="card stat-card"><h3>{daily.notes_created}</h3><p>Notes Today</p></div>
            <div className="card stat-card"><h3>{daily.tasks_pending}</h3><p>Pending Tasks</p></div>
            <div className="card stat-card"><h3>{daily.reviews_due}</h3><p>Reviews Due</p></div>
            <div className="card stat-card"><h3>{daily.total_notes}</h3><p>Total Notes</p></div>
          </div>
          <div className="card">
            <h3>Daily Overview — {new Date(daily.date).toLocaleDateString()}</h3>
            <p style={{ color: 'var(--text-light)', marginTop: '0.5rem' }}>
              You created <strong>{daily.notes_created}</strong> note{daily.notes_created !== 1 ? 's' : ''} today.
              You have <strong>{daily.tasks_pending}</strong> pending task{daily.tasks_pending !== 1 ? 's' : ''} and <strong>{daily.reviews_due}</strong> review{daily.reviews_due !== 1 ? 's' : ''} due.
            </p>
          </div>
        </div>
      )}

      {tab === 'weekly' && weekly && (
        <div>
          <div className="grid" style={{ marginBottom: '1.5rem' }}>
            <div className="card stat-card"><h3>{weekly.notes_created}</h3><p>Notes This Week</p></div>
            <div className="card stat-card"><h3>{weekly.reviews_completed}</h3><p>Reviews Done</p></div>
            <div className="card stat-card"><h3>{weekly.tasks_pending}</h3><p>Pending Tasks</p></div>
            <div className="card stat-card"><h3>{weekly.reviews_due}</h3><p>Reviews Due</p></div>
          </div>

          {weekly.top_topics?.length > 0 && (
            <div className="card" style={{ marginBottom: '1rem' }}>
              <h3 style={{ marginBottom: '0.5rem' }}>Top Topics This Week</h3>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {weekly.top_topics.map(t => <span key={t.topic} className="tag">{t.topic} ({t.count})</span>)}
              </div>
            </div>
          )}

          {weekly.ai_summary && (
            <div className="card" style={{ background: 'rgba(108,92,231,0.05)', borderLeft: '3px solid var(--primary)' }}>
              <h3 style={{ marginBottom: '0.5rem' }}>AI Weekly Insight 🤖</h3>
              <p style={{ color: 'var(--text-light)', lineHeight: 1.6 }}>{weekly.ai_summary}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}