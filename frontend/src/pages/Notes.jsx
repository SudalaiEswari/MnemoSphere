import { useState, useEffect, useRef } from 'react'
import axios from 'axios'

export default function Notes({ token }) {
  const [notes, setNotes] = useState([])
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [tags, setTags] = useState('')
  const [search, setSearch] = useState('')
  const [searchResults, setSearchResults] = useState(null)
  const [listening, setListening] = useState(false)
  const recognitionRef = useRef(null)

  useEffect(() => {
    if (token) loadNotes()
  }, [token])

  const loadNotes = async () => {
    const { data } = await axios.get('/api/notes/', { params: { token } })
    setNotes(data)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const params = new URLSearchParams()
    params.append('token', token)
    params.append('title', title)
    params.append('content', content)
    params.append('tags', tags)
    await axios.post('/api/notes/', params)
    setTitle(''); setContent(''); setTags('')
    loadNotes()
  }

  const handleDelete = async (id) => {
    await axios.delete(`/api/notes/${id}`, { params: { token } })
    loadNotes()
  }

  const handleSearch = async () => {
    if (!search.trim()) return setSearchResults(null)
    const { data } = await axios.post('/api/notes/search', { token, query: search })
    setSearchResults(data)
  }

  const displayNotes = searchResults !== null ? searchResults : notes

  return (
    <div>
      <h1 style={{ marginBottom: '1.5rem' }}>Notes</h1>

      <div className="card" style={{ marginBottom: '2rem' }}>
        <h2 style={{ marginBottom: '1rem' }}>Add New Note</h2>
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <input placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} required style={{ margin: 0, flex: 1 }} />
            <button type="button" className={`btn ${listening ? 'btn-danger' : 'btn-primary'}`} onClick={() => {
              const SR = window.SpeechRecognition || window.webkitSpeechRecognition
              if (!SR) { alert('Voice not supported. Use Chrome.'); return }
              const r = new SR(); r.lang = 'en-US'
              r.onresult = e => { setTitle(e.results[0][0].transcript); setListening(false) }
              r.onend = () => setListening(false); r.start(); setListening(true)
              recognitionRef.current = r
            }} title="Voice input for title">🎤</button>
          </div>
          {listening && <p style={{ color: 'var(--danger)', fontSize: '0.9rem' }}>Listening...</p>}
          <textarea placeholder="Write your note here... (paste text, or describe what you learned)" value={content} onChange={e => setContent(e.target.value)} required />
          <input placeholder="Tags (comma-separated, e.g. python, algorithms)" value={tags} onChange={e => setTags(e.target.value)} />
          <button type="submit" className="btn btn-primary">Save Note</button>
        </form>
      </div>

      <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem' }}>
        <input placeholder="Search your notes..." value={search} onChange={e => setSearch(e.target.value)} style={{ margin: 0 }} />
        <button className="btn btn-primary" onClick={handleSearch}>Search</button>
        {searchResults && <button className="btn btn-outline" onClick={() => { setSearchResults(null); setSearch('') }}>Clear</button>}
      </div>

      {displayNotes.length === 0 ? (
        <div className="empty-state">No notes yet. Add your first note above!</div>
      ) : (
        <div className="grid">
          {displayNotes.map(note => (
            <div key={note.id} className="card">
              <h3>{note.title}</h3>
              {note.summary && <p style={{ color: 'var(--text-light)', fontSize: '0.9rem', margin: '0.5rem 0' }}>{note.summary}</p>}
              <div style={{ margin: '0.5rem 0' }}>
                {note.tags?.map(t => <span key={t} className="tag">{t}</span>)}
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>
                Stage {note.review_stage}/3 · {note.next_review ? new Date(note.next_review).toLocaleDateString() : 'Done'}
              </p>
              <button className="btn btn-danger" style={{ marginTop: '0.5rem' }} onClick={() => handleDelete(note.id)}>Delete</button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
