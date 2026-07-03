import { useState, useEffect } from 'react'
import axios from 'axios'

export default function Goals({ token }) {
  const [goals, setGoals] = useState([])
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('general')
  const [targetDate, setTargetDate] = useState('')

  useEffect(() => { if (token) loadGoals() }, [token])

  const loadGoals = async () => {
    const { data } = await axios.get('/api/goals/', { params: { token } })
    setGoals(data)
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    const params = new URLSearchParams()
    params.append('token', token); params.append('title', title)
    params.append('description', description); params.append('category', category)
    if (targetDate) params.append('target_date', targetDate)
    await axios.post('/api/goals/', params)
    setTitle(''); setDescription(''); setTargetDate('')
    loadGoals()
  }

  const handleProgress = async (id, progress) => {
    const params = new URLSearchParams()
    params.append('token', token); params.append('progress', String(progress))
    await axios.put(`/api/goals/${id}`, params)
    loadGoals()
  }

  const handleDelete = async (id) => {
    await axios.delete(`/api/goals/${id}`, { params: { token } })
    loadGoals()
  }

  const statusColor = (s) => {
    if (s === 'completed') return '#00b894'
    if (s === 'active') return 'var(--primary)'
    return '#636e72'
  }

  return (
    <div>
      <div className="page-header"><h1>Goals 🎯</h1><p>Set targets, track progress, achieve more</p></div>

      <div className="card" style={{ marginBottom: '2rem' }}>
        <h2 style={{ marginBottom: '1rem' }}>New Goal</h2>
        <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input placeholder="Goal title" value={title} onChange={e => setTitle(e.target.value)} required style={{ flex: 1, margin: 0 }} />
            <select value={category} onChange={e => setCategory(e.target.value)} style={{ width: 'auto', margin: 0 }}>
              <option value="general">General</option><option value="study">Study</option><option value="work">Work</option>
              <option value="health">Health</option><option value="finance">Finance</option><option value="personal">Personal</option>
            </select>
          </div>
          <input placeholder="Description (optional)" value={description} onChange={e => setDescription(e.target.value)} />
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <label style={{ fontSize: '0.9rem' }}>Target date:</label>
            <input type="date" value={targetDate} onChange={e => setTargetDate(e.target.value)} style={{ flex: 1, margin: 0 }} />
            <button type="submit" className="btn btn-primary">Create Goal</button>
          </div>
        </form>
      </div>

      {goals.length === 0 ? (
        <div className="empty-state">No goals yet. Set your first goal above!</div>
      ) : (
        <div className="grid">
          {goals.map(goal => (
            <div key={goal.id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <h3 style={{ margin: 0 }}>{goal.title}</h3>
                <span className="tag" style={{ background: statusColor(goal.status), color: 'white' }}>{goal.status}</span>
              </div>
              {goal.description && <p style={{ color: 'var(--text-light)', fontSize: '0.9rem' }}>{goal.description}</p>}
              <div style={{ margin: '0.5rem 0' }}>
                <span className="tag" style={{ background: 'rgba(108,92,231,0.1)', color: 'var(--primary)' }}>{goal.category}</span>
                {goal.target_date && <span className="tag">Due: {new Date(goal.target_date).toLocaleDateString()}</span>}
              </div>
              <div style={{ margin: '0.75rem 0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                  <span>Progress</span><span>{Math.round(goal.progress)}%</span>
                </div>
                <div style={{ height: '8px', background: '#f0f0f0', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${goal.progress}%`, background: 'var(--primary)', borderRadius: '4px', transition: 'width 0.3s' }} />
                </div>
              </div>
              {goal.status !== 'completed' && (
                <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '0.5rem' }}>
                  {[25, 50, 75, 100].map(p => (
                    <button key={p} className="btn btn-outline" style={{ flex: 1, padding: '0.25rem', fontSize: '0.8rem' }}
                      onClick={() => handleProgress(goal.id, p)}>{p}%</button>
                  ))}
                </div>
              )}
              <button className="btn btn-danger" style={{ width: '100%' }} onClick={() => handleDelete(goal.id)}>Delete</button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}