import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'

export default function Dashboard({ token }) {
  const [analytics, setAnalytics] = useState(null)
  const [dueReviews, setDueReviews] = useState([])
  const [tasks, setTasks] = useState([])
  const [notes, setNotes] = useState([])

  useEffect(() => {
    if (!token) return
    axios.get('/api/analytics/dashboard', { params: { token } }).then(r => setAnalytics(r.data))
    axios.get('/api/review/due', { params: { token } }).then(r => setDueReviews(r.data))
    axios.get('/api/tasks/', { params: { token } }).then(r => setTasks(r.data))
    axios.get('/api/notes/', { params: { token } }).then(r => setNotes(r.data))
  }, [token])

  if (!analytics) return <div className="loading">Loading dashboard</div>

  const pendingTasks = tasks.filter(t => t.status !== 'completed')
  const overdueTasks = tasks.filter(t => t.deadline && new Date(t.deadline) < new Date() && t.status !== 'completed')

  return (
    <div>
      <div className="page-header">
        <h1>Dashboard</h1>
        <p>Your memory health at a glance</p>
      </div>

      <div className="grid">
        <div className="card stat-card"><h3>{analytics.total_notes}</h3><p>Total Notes</p></div>
        <div className="card stat-card"><h3>{analytics.total_reviews}</h3><p>Reviews Done</p></div>
        <div className="card stat-card"><h3>{analytics.memory_score}%</h3><p>Memory Score</p></div>
        <div className="card stat-card"><h3>{analytics.reviews_due}</h3><p>Reviews Due</p></div>
        <div className="card stat-card" style={{background: 'var(--bg-card)'}}>
          <h3 style={{ background: 'var(--gradient-warm)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{overdueTasks.length}</h3>
          <p>Overdue Tasks</p>
        </div>
        <div className="card stat-card"><h3>{pendingTasks.length}</h3><p>Pending Tasks</p></div>
      </div>

      {analytics.reviews_due > 0 && (
        <div className="card" style={{ marginTop: '1.5rem', borderLeft: '3px solid var(--warning)', background: 'rgba(255, 209, 102, 0.04)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
            <span>⚠️ <strong>{analytics.reviews_due}</strong> {analytics.reviews_due === 1 ? 'review is' : 'reviews are'} due for reinforcement</span>
            <Link to="/review" className="btn btn-primary btn-sm">Start Review</Link>
          </div>
        </div>
      )}

      <div className="grid" style={{ marginTop: '1.5rem' }}>
        <div className="card">
          <h3 style={{ marginBottom: '1rem', fontSize: '1rem' }}>Recent Activity</h3>
          <div style={{ position: 'relative', paddingLeft: '1.5rem' }}>
            <div className="timeline-line" />
            {[...notes.slice(0, 5), ...tasks.slice(0, 5)].sort((a, b) => {
              return new Date(b.created_at || 0) - new Date(a.created_at || 0)
            }).slice(0, 6).map((item, i) => (
              <div key={i} style={{ position: 'relative', padding: '0.6rem 0 0.6rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <div className="timeline-dot" style={{ color: item.title ? 'var(--primary)' : 'var(--secondary)' }} />
                <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '0.15rem' }}>
                  {item.created_at ? new Date(item.created_at).toLocaleDateString() : ''}
                  {' '}{item.source_type ? '📝' : '📋'}
                </p>
                <p style={{ fontWeight: 500, fontSize: '0.9rem' }}>{item.title}</p>
                {item.summary && <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>{item.summary}</p>}
              </div>
            ))}
            {notes.length === 0 && tasks.length === 0 && <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>No activity yet</p>}
          </div>
          {(notes.length > 0 || tasks.length > 0) && (
            <Link to="/timeline" className="btn btn-secondary btn-sm" style={{ width: '100%', justifyContent: 'center', marginTop: '0.75rem' }}>View Full Timeline →</Link>
          )}
        </div>

        <div>
          {dueReviews.length > 0 && (
            <div className="card" style={{ marginBottom: '1rem' }}>
              <h3 style={{ marginBottom: '0.75rem', fontSize: '1rem' }}>Due for Review</h3>
              {dueReviews.slice(0, 4).map(note => (
                <div key={note.id} style={{ padding: '0.5rem 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <p style={{ fontWeight: 500, fontSize: '0.9rem' }}>{note.title}</p>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Stage {note.stage}/3</p>
                </div>
              ))}
              <Link to="/review" className="btn btn-primary btn-sm" style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem' }}>Review All</Link>
            </div>
          )}

          {pendingTasks.length > 0 && (
            <div className="card">
              <h3 style={{ marginBottom: '0.75rem', fontSize: '1rem' }}>Upcoming Tasks</h3>
              {pendingTasks.slice(0, 4).map(task => (
                <div key={task.id} style={{ padding: '0.5rem 0', borderBottom: '1px solid rgba(255,255,255,0.04)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <p style={{ fontWeight: 500, fontSize: '0.85rem' }}>{task.title}</p>
                    {task.deadline && <p style={{ fontSize: '0.75rem', color: new Date(task.deadline) < new Date() ? 'var(--danger)' : 'var(--text-dim)' }}>
                      {new Date(task.deadline).toLocaleDateString()}
                    </p>}
                  </div>
                  <span className={`tag ${task.priority === 'high' ? '' : ''}`} style={{ background: task.priority === 'high' ? 'rgba(239,71,111,0.12)' : 'rgba(255,255,255,0.04)', color: task.priority === 'high' ? 'var(--danger)' : 'var(--text-muted)' }}>
                    {task.priority}
                  </span>
                </div>
              ))}
              <Link to="/tasks" className="btn btn-secondary btn-sm" style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem' }}>All Tasks →</Link>
            </div>
          )}
        </div>
      </div>

      {analytics.topics_mastered?.length > 0 && (
        <div className="card" style={{ marginTop: '1.5rem' }}>
          <h3 style={{ marginBottom: '0.75rem', fontSize: '1rem' }}>🏆 Topics Mastered</h3>
          {analytics.topics_mastered.map(t => <span key={t} className="tag tag-study">{t}</span>)}
        </div>
      )}
    </div>
  )
}