import { useState } from 'react'
import axios from 'axios'

export default function Assistant({ token }) {
  const [question, setQuestion] = useState('')
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)

  const handleAsk = async () => {
    if (!question.trim()) return
    const userMsg = { role: 'user', text: question }
    setMessages(prev => [...prev, userMsg])
    setQuestion('')
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.append('token', token)
      params.append('question', userMsg.text)
      const { data } = await axios.post('/api/assistant/ask', params)
      setMessages(prev => [...prev, { role: 'assistant', text: data.answer }])
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', text: '⚠️ Error: Could not reach AI. Check your Groq API key.' }])
    }
    setLoading(false)
  }

  return (
    <div>
      <div className="page-header"><h1>AI Assistant</h1><p>Chat with your memory — ask questions, get insights</p></div>
      <div className="card" style={{ minHeight: '400px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ flex: 1, overflowY: 'auto', marginBottom: '1rem' }}>
          {messages.length === 0 && (
            <div style={{ textAlign: 'center', color: 'var(--text-light)', padding: '3rem' }}>
              <p style={{ fontSize: '3rem', marginBottom: '1rem' }}>🤖</p>
              <p>Ask me anything about your notes!</p>
              <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>Example: "What did I learn about Python?" or "Summarize my meeting notes"</p>
            </div>
          )}
          {messages.map((msg, i) => (
            <div key={i} style={{
              marginBottom: '1rem', padding: '1rem', borderRadius: '12px',
              background: msg.role === 'user' ? 'rgba(124,92,252,0.12)' : 'rgba(255,255,255,0.04)',
              maxWidth: '85%', marginLeft: msg.role === 'user' ? 'auto' : '0',
            }}>
              <p style={{ fontWeight: 600, marginBottom: '0.3rem', color: msg.role === 'user' ? 'var(--primary)' : 'var(--secondary)' }}>
                {msg.role === 'user' ? 'You' : 'MnemoSphere'}
              </p>
              <p style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</p>
            </div>
          ))}
          {loading && (
            <div style={{ textAlign: 'center', color: 'var(--text-light)', padding: '1rem' }}>
              Thinking...
            </div>
          )}
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            placeholder="Ask a question about your notes..."
            value={question}
            onChange={e => setQuestion(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAsk()}
            style={{ margin: 0 }}
          />
          <button className="btn btn-primary" onClick={handleAsk} disabled={loading}>Ask</button>
        </div>
      </div>
    </div>
  )
}
