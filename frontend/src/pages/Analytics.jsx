import { useState, useEffect } from 'react'
import axios from 'axios'

export default function Analytics({ token }) {
  const [data, setData] = useState(null)

  useEffect(() => {
    if (token) {
      axios.get('/api/analytics/dashboard', { params: { token } }).then(r => setData(r.data))
    }
  }, [token])

  if (!data) return <div className="loading">Loading analytics...</div>

  return (
    <div>
      <h1 style={{ marginBottom: '1.5rem' }}>Analytics</h1>
      <div className="grid">
        <div className="card stat-card">
          <h3>{data.total_notes}</h3>
          <p>Total Notes</p>
        </div>
        <div className="card stat-card">
          <h3>{data.total_reviews}</h3>
          <p>Reviews Completed</p>
        </div>
        <div className="card stat-card">
          <h3>{data.memory_score}%</h3>
          <p>Memory Score</p>
        </div>
        <div className="card stat-card">
          <h3>{data.reviews_due}</h3>
          <p>Reviews Due</p>
        </div>
        <div className="card stat-card">
          <h3>{data.streak_days}</h3>
          <p>Total Reviews</p>
        </div>
      </div>

      <div className="grid" style={{ marginTop: '2rem' }}>
        {data.topics_mastered.length > 0 && (
          <div className="card">
            <h3>Topics Mastered</h3>
            <div style={{ marginTop: '0.5rem' }}>
              {data.topics_mastered.map(t => <span key={t} className="tag">{t}</span>)}
            </div>
          </div>
        )}
        {data.topics_struggling.length > 0 && (
          <div className="card">
            <h3>Needs Practice</h3>
            <div style={{ marginTop: '0.5rem' }}>
              {data.topics_struggling.map(t => <span key={t} className="tag">{t}</span>)}
            </div>
          </div>
        )}
      </div>

      <div className="card" style={{ marginTop: '2rem' }}>
        <h3>Memory Progress</h3>
        <div style={{ marginTop: '1rem', background: '#e0e0e0', borderRadius: '20px', height: '24px', overflow: 'hidden' }}>
          <div style={{
            width: `${Math.min(data.memory_score, 100)}%`,
            background: 'linear-gradient(90deg, var(--primary), var(--secondary))',
            height: '100%', borderRadius: '20px', transition: 'width 0.5s',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontSize: '0.8rem', fontWeight: 600,
          }}>
            {data.memory_score}%
          </div>
        </div>
        <p style={{ color: 'var(--text-light)', marginTop: '0.5rem' }}>
          {data.memory_score >= 70 ? 'Great job! Keep reviewing regularly.' :
           data.memory_score >= 40 ? 'Good progress! Consistent review will improve your score.' :
           'Start reviewing your notes to build your memory score.'}
        </p>
      </div>
    </div>
  )
}
