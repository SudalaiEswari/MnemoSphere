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

  if (!analytics) return <div className="loading">Loading dashboard...</div>

  const pendingTasks = tasks.filter(t => t.status !== 'completed')
  const overdueTasks = tasks.filter(t => t.deadline && new Date(t.deadline) < new Date() && t.status !== 'completed')

  return (
    <div>
      <h1 style={{ marginBottom: '1.5rem' }}>Dashboard</h1>
      <div className="grid">
        <div className="card stat-card">
          <h3>{analytics.total_notes}</h3>
          <p>Total Notes</p>
        </div>
        <div className="card stat-card">
          <h3>{analytics.total_reviews}</h3>
          <p>Reviews Done</p>
        </div>
        <div className="card stat-card">
          <h3>{analytics.memory_score}%</h3>
          <p>Memory Score</p>
        </div>
        <div className="card stat-card">
          <h3>{analytics.reviews_due}</h3>
          <p>Reviews Due</p>
        </div>
        <div className="card stat-card" style={{ borderLeft: '4px solid #e17055' }}>
          <h3>{overdueTasks.length}</h3>
          <p>Overdue Tasks</p>
        </div>
        <div className="card stat-card">
          <h3>{pendingTasks.length}</h3>
          <p>Pending Tasks</p>
        </div>
      </div>

      {/* Timeline: Recent Activity */}
      <div className="card" style={{ marginTop: '2rem' }}>
        <h2 style={{ marginBottom: '1rem' }}>Recent Activity</h2>
        <div style={{ position: 'relative', paddingLeft: '2rem' }}>
          <div style={{ position: 'absolute', left: '0.5rem', top: 0, bottom: 0, width: '2px', background: 'var(--primary)', opacity: 0.3 }} />
          {[...notes.slice(0, 5), ...tasks.slice(0, 5)].sort((a, b) => {
            const dateA = a.created_at || a.next_review
            const dateB = b.created_at || b.next_review
            return new Date(dateB) - new Date(dateA)
          }).slice(0, 8).map((item, i) => (
            <div key={i} style={{ position: 'relative', padding: '0.5rem 0 0.5rem 1.5rem', borderBottom: '1px solid #f0f0f0' }}>
              <div style={{ position: 'absolute', left: '-1.35rem', top: '0.8rem', width: '12px', height: '12px', borderRadius: '50%', background: item.title ? 'var(--primary)' : 'var(--secondary)', border: '2px solid white' }} />
              <p style={{ fontSize: '0.85rem', color: 'var(--text-light)' }}>
                {item.created_at ? new Date(item.created_at).toLocaleDateString() : ''}
                {' '}{item.source_type ? '📝 Note' : '📋 Task'}
              </p>
              <p style={{ fontWeight: 500 }}>{item.title}</p>
              {item.summary && <p style={{ fontSize: '0.85rem', color: 'var(--text-light)' }}>{item.summary}</p>}
            </div>
          ))}
        </div>
      </div>

      <div className="grid" style={{ marginTop: '2rem' }}>
        {dueReviews.length > 0 && (
          <div className="card">
            <h3>Due for Review</h3>
            {dueReviews.slice(0, 3).map(note => (
              <div key={note.id} style={{ padding: '0.5rem 0', borderBottom: '1px solid #f0f0f0' }}>
                <p style={{ fontWeight: 500 }}>{note.title}</p>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-light)' }}>Stage {note.stage}/3</p>
              </div>
            ))}
            {dueReviews.length > 0 && <Link to="/review" className="btn btn-primary" style={{ marginTop: '0.5rem', width: '100%' }}>Review All</Link>}
          </div>
        )}

        {pendingTasks.length > 0 && (
          <div className="card">
            <h3>Upcoming Tasks</h3>
            {pendingTasks.slice(0, 5).map(task => (
              <div key={task.id} style={{ padding: '0.5rem 0', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ fontWeight: 500, fontSize: '0.9rem' }}>{task.title}</p>
                  {task.deadline && <p style={{ fontSize: '0.8rem', color: new Date(task.deadline) < new Date() ? 'var(--danger)' : 'var(--text-light)' }}>
                    {new Date(task.deadline).toLocaleDateString()}
                  </p>}
                </div>
                <span className="tag" style={{ background: task.priority === 'high' ? 'rgba(225,112,85,0.1)' : 'rgba(0,0,0,0.05)', color: task.priority === 'high' ? 'var(--danger)' : 'var(--text-light)' }}>
                  {task.priority}
                </span>
              </div>
            ))}
            <Link to="/tasks" className="btn btn-outline" style={{ marginTop: '0.5rem', width: '100%' }}>View All Tasks</Link>
          </div>
        )}
      </div>

      {analytics.topics_mastered.length > 0 && (
        <div style={{ marginTop: '2rem' }}>
          <h2 style={{ marginBottom: '1rem' }}>Topics Mastered</h2>
          {analytics.topics_mastered.map(t => <span key={t} className="tag">{t}</span>)}
        </div>
      )}
    </div>
  )
}
