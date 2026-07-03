import { useState, useEffect } from 'react'
import axios from 'axios'

export default function Habits({ token }) {
  const [habits, setHabits] = useState([])
  const [name, setName] = useState('')
  const [frequency, setFrequency] = useState('daily')
  const [category, setCategory] = useState('general')

  useEffect(() => { if (token) loadHabits() }, [token])

  const loadHabits = async () => {
    const { data } = await axios.get('/api/habits/', { params: { token } })
    setHabits(data)
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    const params = new URLSearchParams()
    params.append('token', token); params.append('name', name)
    params.append('frequency', frequency); params.append('category', category)
    await axios.post('/api/habits/', params)
    setName('')
    loadHabits()
  }

  const handleCheckin = async (id) => {
    const params = new URLSearchParams()
    params.append('token', token)
    await axios.post(`/api/habits/${id}/checkin`, params)
    loadHabits()
  }

  const handleDelete = async (id) => {
    await axios.delete(`/api/habits/${id}`, { params: { token } })
    loadHabits()
  }

  return (
    <div>
      <h1 style={{ marginBottom: '1.5rem' }}>Habits 🔄</h1>

      <div className="card" style={{ marginBottom: '2rem' }}>
        <h2 style={{ marginBottom: '1rem' }}>New Habit</h2>
        <form onSubmit={handleCreate} style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <input placeholder="Habit name (e.g. Study 1 hour)" value={name} onChange={e => setName(e.target.value)} required style={{ flex: 1, margin: 0 }} />
          <select value={frequency} onChange={e => setFrequency(e.target.value)} style={{ width: 'auto', margin: 0 }}>
            <option value="daily">Daily</option><option value="weekly">Weekly</option>
          </select>
          <select value={category} onChange={e => setCategory(e.target.value)} style={{ width: 'auto', margin: 0 }}>
            <option value="general">General</option><option value="study">Study</option><option value="health">Health</option>
            <option value="work">Work</option><option value="personal">Personal</option>
          </select>
          <button type="submit" className="btn btn-primary">Add Habit</button>
        </form>
      </div>

      {habits.length === 0 ? (
        <div className="empty-state">No habits yet. Create your first habit above!</div>
      ) : (
        <div className="grid">
          {habits.map(habit => (
            <div key={habit.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0 }}>{habit.name}</h3>
                <span className="tag" style={{ background: habit.today_done ? 'rgba(0,184,148,0.1)' : 'rgba(225,112,85,0.1)', color: habit.today_done ? '#00b894' : 'var(--danger)' }}>
                  {habit.today_done ? '✅ Done today' : '⏳ Pending'}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <span className="tag">{habit.frequency}</span>
                <span className="tag">{habit.category}</span>
              </div>
              <div style={{ display: 'flex', gap: '1rem', fontSize: '0.85rem', color: 'var(--text-light)' }}>
                <span>🔥 Streak: <strong>{habit.streak}</strong></span>
                <span>🏆 Best: <strong>{habit.longest_streak}</strong></span>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {!habit.today_done && (
                  <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => handleCheckin(habit.id)}>✅ Check In</button>
                )}
                <button className="btn btn-danger" onClick={() => handleDelete(habit.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}