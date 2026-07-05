import { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import { useToast } from '../components/Toast'

export default function Tasks({ token }) {
  const addToast = useToast()
  const [tasks, setTasks] = useState([])
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('general')
  const [priority, setPriority] = useState('medium')
  const [deadline, setDeadline] = useState('')
  const [filter, setFilter] = useState('')
  const [listening, setListening] = useState(false)
  const recognitionRef = useRef(null)

  useEffect(() => {
    if (token) loadTasks()
  }, [token, filter])

  const loadTasks = async () => {
    const params = { token }
    if (filter) params.status = filter
    const { data } = await axios.get('/api/tasks/', { params })
    setTasks(data)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const p = { token, title, description, category, priority }
    if (deadline) p.deadline = new Date(deadline).toISOString()
    await axios.post('/api/tasks/', null, { params: p })
    setTitle(''); setDescription(''); setDeadline('')
    addToast('Task created!', 'task', 4000)
    loadTasks()
  }

  const handleStatus = async (id, status) => {
    await axios.put(`/api/tasks/${id}`, null, { params: { token, status } })
    addToast(`Task ${status === 'completed' ? 'completed' : 'updated'}!`, 'success', 4000)
    loadTasks()
  }

  const handleDelete = async (id) => {
    await axios.delete(`/api/tasks/${id}`, { params: { token } })
    loadTasks()
  }

  const startVoice = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) { alert('Voice input not supported in this browser. Try Chrome.'); return }
    const recognition = new SpeechRecognition()
    recognition.lang = 'en-US'
    recognition.onresult = (e) => setTitle(e.results[0][0].transcript)
    recognition.onend = () => setListening(false)
    recognition.onerror = () => setListening(false)
    recognition.start()
    setListening(true)
    recognitionRef.current = recognition
  }

  const priorityColor = { high: '#e17055', medium: '#fdcb6e', low: '#00b894' }

  return (
    <div>
      <div className="page-header"><h1>Tasks & Reminders</h1><p>Track deadlines, priorities, and assignments</p></div>
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ marginBottom: '1rem', fontSize: '1rem' }}>✏️ New Task</h3>
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <input placeholder="Task title..." value={title} onChange={e => setTitle(e.target.value)} required style={{ margin: 0, flex: 1 }} />
            <button type="button" className={`btn ${listening ? 'btn-danger' : 'btn-primary'}`} onClick={startVoice} title="Voice input">
              🎤
            </button>
          </div>
          {listening && <p style={{ color: 'var(--danger)', fontSize: '0.9rem' }}>Listening...</p>}
          <textarea placeholder="Description..." value={description} onChange={e => setDescription(e.target.value)} />
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <select value={category} onChange={e => setCategory(e.target.value)} style={{ width: 'auto', flex: 1 }}>
              <option value="general">General</option>
              <option value="study">Study</option>
              <option value="work">Work</option>
              <option value="personal">Personal</option>
              <option value="health">Health</option>
              <option value="finance">Finance</option>
            </select>
            <select value={priority} onChange={e => setPriority(e.target.value)} style={{ width: 'auto', flex: 1 }}>
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
            </select>
            <input type="date" value={deadline} onChange={e => setDeadline(e.target.value)} style={{ width: 'auto', flex: 1 }} />
            <button type="submit" className="btn btn-primary">Add Task</button>
          </div>
        </form>
      </div>

      <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem' }}>
        {['', 'pending', 'completed', 'overdue'].map(f => (
          <button key={f} className={`btn ${filter === f ? 'btn-primary' : 'btn-outline'}`} onClick={() => setFilter(f)}>
            {f || 'All'}
          </button>
        ))}
      </div>

      {tasks.length === 0 ? (
        <div className="empty-state">No tasks yet. Add your first task above!</div>
      ) : (
        <div className="grid">
          {tasks.map(task => (
            <div key={task.id} className="card" style={{ borderLeft: `4px solid ${priorityColor[task.priority] || '#636e72'}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <h3 style={{ textDecoration: task.status === 'completed' ? 'line-through' : 'none' }}>{task.title}</h3>
                <span className="tag">{task.category}</span>
              </div>
              {task.description && <p style={{ color: 'var(--text-light)', fontSize: '0.9rem', margin: '0.5rem 0' }}>{task.description}</p>}
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                <span className="tag" style={{ background: `${priorityColor[task.priority]}22`, color: priorityColor[task.priority] }}>{task.priority}</span>
                {task.deadline && <span className="tag" style={{ background: new Date(task.deadline) < new Date() ? 'rgba(225,112,85,0.1)' : 'rgba(0,0,0,0.05)', color: new Date(task.deadline) < new Date() ? 'var(--danger)' : 'var(--text-light)' }}>
                  {new Date(task.deadline).toLocaleDateString()}
                </span>}
                <span className="tag">{task.status}</span>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.8rem' }}>
                {task.status !== 'completed' ? (
                  <button className="btn btn-success" onClick={() => handleStatus(task.id, 'completed')}>✓ Done</button>
                ) : (
                  <button className="btn btn-outline" onClick={() => handleStatus(task.id, 'pending')}>↩ Undo</button>
                )}
                <button className="btn btn-danger" onClick={() => handleDelete(task.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
