import { useState } from 'react'

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition

export default function VoiceInput({ onResult }) {
  const [listening, setListening] = useState(false)
  const [recognition, setRecognition] = useState(null)

  const toggleListening = () => {
    if (listening) {
      listening && recognition?.stop()
      setListening(false)
      return
    }
    if (!SpeechRecognition) {
      alert('Voice input not supported in this browser')
      return
    }
    const rec = new SpeechRecognition()
    rec.lang = 'en-US'
    rec.continuous = false
    rec.interimResults = false
    rec.onresult = (e) => {
      const text = e.results[0][0].transcript
      onResult(text)
      setListening(false)
    }
    rec.onerror = () => setListening(false)
    rec.onend = () => setListening(false)
    rec.start()
    setRecognition(rec)
    setListening(true)
  }

  return (
    <button
      className={`btn btn-voice ${listening ? 'listening' : ''}`}
      onClick={toggleListening}
      title={listening ? 'Listening...' : 'Voice input'}
    >
      {listening ? '🎙️' : '🎤'}
    </button>
  )
}
