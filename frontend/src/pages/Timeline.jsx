import { useState, useEffect } from 'react'
import axios from 'axios'

export default function Timeline({ token }) {
  const [items, setItems] = useState([])
  const [days, setDays] = useState(30)

  useEffect(() => {
    if (token) loadTimeline()
  }, [token, days])

  const loadTimeline = async () => {
    const { data } = await axios.get('/api/timeline/', { params: { token, days } })
    setItems(data)
  }

  const typeIcon = (t) => {
    if (t === 'note') return '📝'
    if (t === 'task') return '📋'
    if (t === 'review') return '🔄'
    if (t === 'goal') return '🎯'
    return '📌'
  }

  const typeColor = (t) => {
    if (t === 'note') return 'var(--primary)'
    if (t === 'task') return 'var(--secondary)'
    if (t === 'review') return '#e17055'
    if (t === 'goal') return '#00b894'
    return '#636e72'
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ margin: 0 }}>Timeline</h1>
        <select value={days} onChange={e => setDays(Number(e.target.value))} className="btn btn-outline" style={{ width: 'auto' }}>
          <option value={7}>Last 7 days</option>
          <option value={30}>Last 30 days</option>
          <option value={90}>Last 90 days</option>
        </select>
      </div>

      {items.length === 0 ? (
        <div className="empty-state">No activity yet. Start by adding notes or tasks!</div>
      ) : (
        <div style={{ position: 'relative', paddingLeft: '2rem' }}>
          <div style={{ position: 'absolute', left: '0.8rem', top: 0, bottom: 0, width: '2px', background: 'var(--primary)', opacity: 0.2 }} />
          {items.map((item, i) => (
            <div key={i} style={{ position: 'relative', padding: '0.8rem 0 0.8rem 1.5rem', borderBottom: '1px solid #f0f0f0' }}>
              <div style={{
                position: 'absolute', left: '-1.05rem', top: '1rem',
                width: '14px', height: '14px', borderRadius: '50%',
                background: typeColor(item.type), border: '2px solid white',
              }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '1.1rem' }}>{typeIcon(item.type)}</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{item.type}</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>{new Date(item.date).toLocaleDateString()}</span>
                {item.category && <span className="tag">{item.category}</span>}
              </div>
              <p style={{ fontWeight: 500, margin: '0.25rem 0' }}>{item.title}</p>
              {item.description && <p style={{ fontSize: '0.85rem', color: 'var(--text-light)' }}>{item.description}</p>}
              {item.tags?.length > 0 && (
                <div style={{ marginTop: '0.25rem' }}>
                  {item.tags.map(t => <span key={t} className="tag">{t}</span>)}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}