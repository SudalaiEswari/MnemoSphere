import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import VoiceInput from '../components/VoiceInput'

export default function Assistant({ token }) {
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState('chat')
  const [suggestions, setSuggestions] = useState([])
  const [connections, setConnections] = useState(null)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (!token) return
    axios.get('/api/agent/today', { params: { token } }).then(r => setSuggestions(r.data?.recommendations || ''))
    axios.get('/api/agent/connections', { params: { token } }).then(r => setConnections(r.data))
  }, [token])

  const handleSend = async (text) => {
    const q = (text || input).trim()
    if (!q || loading) return
    setInput('')
    setMessages(prev => [...prev, { role: 'user', text: q }])
    setLoading(true)
    try {
      let data
      if (mode === 'twin') {
        const resp = await axios.post('/api/agent/memory-twin', null, { params: { token, query: q } })
        data = resp.data
        setMessages(prev => [...prev, {
          role: 'assistant',
          text: data.answer,
          meta: `Used ${data.related_notes} related notes · Weakest: ${data.weakest?.map?.(w => `${w[0]} (${w[1]}%)`).join(', ') || 'none'}`,
        }])
      } else {
        const resp = await axios.post('/api/agent/ask', null, { params: { token, question: q } })
        data = resp.data
        setMessages(prev => [...prev, {
          role: 'assistant',
          text: data.answer,
          meta: data.rag ? '🔍 RAG: Searched your notes for relevant context' : '📝 Using recent notes as context',
        }])
      }
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', text: '⚠️ Error. Check your API key.', meta: '' }])
    }
    setLoading(false)
  }

  const handleVoiceResult = (text) => {
    setInput(text)
    handleSend(text)
  }

  const suggestionQueries = [
    'What should I review today?',
    'What do I keep forgetting?',
    'Connect my related notes',
    'Explain my weakest topic',
    'Create a quiz for me',
  ]

  return (
    <div>
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <h1>🤖 Memory Twin AI</h1>
            <p>Your personal AI agent that knows everything you've learned</p>
          </div>
          <div className="btn-group">
            <button className={`btn btn-sm ${mode === 'chat' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setMode('chat')}>RAG Chat</button>
            <button className={`btn btn-sm ${mode === 'twin' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setMode('twin')}>Memory Twin</button>
          </div>
        </div>
      </div>

      {/* Suggestions */}
      {messages.length === 0 && suggestions && (
        <div className="card" style={{ marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '0.9rem', marginBottom: '0.5rem', color: 'var(--secondary)' }}>💡 Today's Suggestions</h3>
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>{suggestions}</pre>
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginTop: '0.75rem' }}>
            {suggestionQueries.map(q => (
              <button key={q} className="btn btn-secondary btn-xs" onClick={() => handleSend(q)}>{q}</button>
            ))}
          </div>
        </div>
      )}

      {/* Connections */}
      {messages.length === 0 && connections?.connections?.length > 0 && (
        <div className="card" style={{ marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '0.9rem', marginBottom: '0.5rem', color: 'var(--primary)' }}>🔗 Discovered Connections</h3>
          {connections.connections.slice(0, 4).map((c, i) => (
            <div key={i} style={{
              padding: '0.5rem 0', borderBottom: '1px solid rgba(255,255,255,0.04)',
              fontSize: '0.85rem',
            }}>
              <span style={{ color: 'var(--secondary)' }}>{c.note_a}</span>
              <span style={{ color: 'var(--text-dim)', margin: '0 0.5rem' }}>↔</span>
              <span style={{ color: 'var(--secondary)' }}>{c.note_b}</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginLeft: '0.5rem' }}>
                {(c.similarity * 100).toFixed(0)}% match
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Chat Messages */}
      <div className="card" style={{ minHeight: '350px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ flex: 1, overflowY: 'auto', marginBottom: '1rem' }}>
          {messages.length === 0 && (
            <div style={{ textAlign: 'center', color: 'var(--text-light)', padding: '2rem' }}>
              <p style={{ fontSize: '3rem', marginBottom: '1rem' }}>🧠</p>
              <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Memory Twin AI is ready</p>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                {mode === 'twin'
                  ? 'Ask me anything — I know what you know'
                  : 'Ask a question and I\'ll search your notes for the answer'}
              </p>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: '0.5rem' }}>
                Examples: "What did I learn about ESP32?" · "Summarize my IoT notes" · "What should I review today?"
              </p>
            </div>
          )}
          {messages.map((msg, i) => (
            <div key={i} style={{
              marginBottom: '0.75rem', padding: '0.85rem 1rem', borderRadius: '12px',
              background: msg.role === 'user' ? 'rgba(124,92,252,0.12)' : 'rgba(255,255,255,0.04)',
              maxWidth: '90%', marginLeft: msg.role === 'user' ? 'auto' : '0',
            }}>
              <p style={{ fontWeight: 600, marginBottom: '0.3rem', fontSize: '0.8rem', color: msg.role === 'user' ? 'var(--primary)' : 'var(--secondary)' }}>
                {msg.role === 'user' ? 'You' : 'Memory Twin'}
              </p>
              <p style={{ whiteSpace: 'pre-wrap', fontSize: '0.9rem', lineHeight: '1.6' }}>{msg.text}</p>
              {msg.meta && <p style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: '0.4rem' }}>{msg.meta}</p>}
            </div>
          ))}
          {loading && (
            <div style={{ textAlign: 'center', color: 'var(--text-light)', padding: '1rem', fontSize: '0.9rem' }}>
              <span className="pulse">Thinking</span>...
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <VoiceInput onResult={handleVoiceResult} />
          <input
            placeholder={mode === 'twin' ? 'Ask Memory Twin AI anything...' : 'Search your notes with AI...'}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            style={{ margin: 0 }}
          />
          <button className="btn btn-primary" onClick={() => handleSend()} disabled={loading}>
            {mode === 'twin' ? 'Ask Twin' : 'Search'}
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', flexWrap: 'wrap' }}>
        <Link to="/notes" className="btn btn-secondary btn-sm">📝 Notes</Link>
        <Link to="/review" className="btn btn-secondary btn-sm">🔄 Review</Link>
        <Link to="/quiz" className="btn btn-secondary btn-sm">🎯 Quiz</Link>
        <Link to="/dashboard" className="btn btn-secondary btn-sm">📊 Dashboard</Link>
      </div>
    </div>
  )
}
