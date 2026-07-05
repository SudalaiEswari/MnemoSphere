import { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import { useToast } from '../components/Toast'

export default function Notes({ token }) {
  const addToast = useToast()
  const [notes, setNotes] = useState([])
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [tags, setTags] = useState('')
  const [search, setSearch] = useState('')
  const [searchResults, setSearchResults] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState(null)
  const fileRef = useRef(null)

  useEffect(() => { if (token) loadNotes() }, [token])

  const loadNotes = async () => {
    const { data } = await axios.get('/api/notes/', { params: { token } })
    setNotes(data)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    await axios.post('/api/notes/', null, { params: { token, title, content, tags } })
    setTitle(''); setContent(''); setTags(''); setPreview(null)
    addToast('Note saved! Scheduled for review tomorrow.', 'success', 4000)
    loadNotes()
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const form = new FormData()
    form.append('token', token); form.append('title', file.name); form.append('file', file)
    try {
      const { data } = await axios.post('/api/notes/upload', form)
      if (data.preview) {
        setPreview(file)
        setTitle(data.title)
        setContent(data.content)
        setTags(data.tags || '')
        addToast('File uploaded! Edit the text then click Save Note.', 'success', 4000)
      }
    } catch (err) {
      addToast('Upload failed: ' + (err.response?.data?.detail || err.message), 'warning', 5000)
    }
    setUploading(false)
    if (fileRef.current) fileRef.current.value = ''
  }

  const handleDelete = async (id) => {
    await axios.delete(`/api/notes/${id}`, { params: { token } })
    loadNotes()
  }

  const handleSearch = async () => {
    if (!search.trim()) return setSearchResults(null)
    const { data } = await axios.post('/api/notes/search', null, { params: { token, query: search } })
    setSearchResults(data)
  }

  const clearPreview = () => {
    setPreview(null)
    setTitle(''); setContent(''); setTags('')
    if (fileRef.current) fileRef.current.value = ''
  }

  const displayNotes = searchResults !== null ? searchResults : notes

  const sourceIcon = (s) => s === 'image' ? '🖼️' : s === 'file' ? '📎' : '📝'
  const catClass = (c) => c === 'study' ? 'tag-study' : c === 'work' ? 'tag-work' : c === 'personal' ? 'tag-personal' : c === 'health' ? 'tag-health' : c === 'finance' ? 'tag-finance' : ''

  return (
    <div>
      <div className="page-header">
        <h1>Notes</h1>
        <p>Capture ideas, upload files, or search your knowledge</p>
      </div>

      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ marginBottom: '1rem', fontSize: '1rem' }}>
          {preview ? '🖼️ Preview — Edit & Save' : '✏️ New Note'}
        </h3>
        <form onSubmit={handleSubmit}>
          <input placeholder="Note title" value={title} onChange={e => setTitle(e.target.value)} required style={{ marginBottom: '0.5rem' }} />
          <textarea placeholder="What did you learn today? Paste text from documents, books, or lectures..." value={content} onChange={e => setContent(e.target.value)} required />
          <input placeholder="Tags: python, algorithms, AI (comma-separated)" value={tags} onChange={e => setTags(e.target.value)} />
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button type="submit" className="btn btn-primary">💾 Save Note</button>
            <button type="button" className="btn btn-outline" onClick={() => fileRef.current?.click()} disabled={uploading}>
              {uploading ? '⏳ Processing...' : '📎 Upload Image / File'}
            </button>
            {preview && (
              <button type="button" className="btn btn-outline" onClick={clearPreview}>✕ Cancel</button>
            )}
            <input ref={fileRef} type="file" accept="image/*,.pdf,.txt" style={{ display: 'none' }} onChange={handleFileUpload} />
          </div>
        </form>
      </div>

      <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '0.5rem' }}>
        <input placeholder="Search notes by keyword or question..." value={search} onChange={e => setSearch(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSearch()} style={{ margin: 0 }} />
        <button className="btn btn-primary btn-sm" onClick={handleSearch}>🔍 Search</button>
        {searchResults && <button className="btn btn-outline btn-sm" onClick={() => { setSearchResults(null); setSearch('') }}>✕ Clear</button>}
      </div>

      {displayNotes.length === 0 ? (
        <div className="empty-state">
          <div className="icon">📝</div>
          <h3>No notes yet</h3>
          <p>Create your first note above or upload a file to get started</p>
        </div>
      ) : (
        <div className="grid">
          {displayNotes.map(note => (
            <div key={note.id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>{sourceIcon(note.source_type)} {note.title}</h3>
                {note.category && <span className={`tag ${catClass(note.category)}`}>{note.category}</span>}
              </div>
              {note.summary && <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.5rem', lineHeight: 1.5 }}>{note.summary}</p>}
              <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '0.5rem', maxHeight: '3em', overflow: 'hidden' }}>{note.content?.slice(0, 120)}</p>
              {note.tags?.length > 0 && (
                <div style={{ marginBottom: '0.5rem' }}>{note.tags.map(t => <span key={t} className="tag">{t}</span>)}</div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                <span>Stage {note.review_stage}/3</span>
                <span>{note.next_review ? new Date(note.next_review).toLocaleDateString() : '✅ Mastered'}</span>
              </div>
              <button className="btn btn-danger btn-sm" style={{ width: '100%', marginTop: '0.75rem', justifyContent: 'center' }} onClick={() => handleDelete(note.id)}>Delete</button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
