import { useState, useEffect } from 'react'
import axios from 'axios'

export default function Review({ token }) {
  const [dueNotes, setDueNotes] = useState([])
  const [currentIndex, setCurrentIndex] = useState(-1)
  const [questions, setQuestions] = useState([])
  const [currentQ, setCurrentQ] = useState(0)
  const [selected, setSelected] = useState('')
  const [answered, setAnswered] = useState(false)
  const [score, setScore] = useState(0)
  const [total, setTotal] = useState(0)
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (token) {
      axios.get('/api/review/due', { params: { token } }).then(r => {
        setDueNotes(r.data)
        if (r.data.length > 0) setCurrentIndex(0)
      })
    }
  }, [token])

  useEffect(() => {
    if (currentIndex >= 0 && currentIndex < dueNotes.length) {
      loadQuestions(dueNotes[currentIndex].id)
    }
  }, [currentIndex, dueNotes])

  const loadQuestions = async (noteId) => {
    const { data } = await axios.post('/api/quiz/generate', null, { params: { note_id: noteId, token } })
    setQuestions(data.questions || [])
    setCurrentQ(0)
    setSelected('')
    setAnswered(false)
    setDone(false)
  }

  const handleAnswer = (option) => {
    if (answered) return
    setSelected(option)
    setAnswered(true)
    setTotal(t => t + 1)
    const isCorrect = option === questions[currentQ]?.correct_answer
    if (isCorrect) setScore(s => s + 1)
  }

  const nextQuestion = async () => {
    const q = questions[currentQ]
    if (q) {
      await axios.post('/api/quiz/submit', {
        note_id: dueNotes[currentIndex].id,
        question: q.question,
        user_answer: selected,
        correct_answer: q.correct_answer,
        is_correct: selected === q.correct_answer,
      }, { params: { token } })
    }
    if (currentQ < questions.length - 1) {
      setCurrentQ(c => c + 1)
      setSelected('')
      setAnswered(false)
    } else {
      await completeReview()
    }
  }

  const completeReview = async () => {
    const finalScore = total > 0 ? score / total : 0
    await axios.post('/api/review/complete', null, {
      params: { note_id: dueNotes[currentIndex].id, score: finalScore, token }
    })
    setDone(true)
  }

  const nextNote = () => {
    if (currentIndex < dueNotes.length - 1) {
      setCurrentIndex(i => i + 1)
      setScore(0)
      setTotal(0)
      setDone(false)
    } else {
      setDueNotes([])
      setCurrentIndex(-1)
    }
  }

  if (dueNotes.length === 0) {
    return (
      <div>
        <div className="page-header"><h1>Review</h1><p>Active recall quizzes for long-term memory</p></div>
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <h2>All caught up! 🎉</h2>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>No notes due for review. Add more notes or check back later.</p>
        </div>
      </div>
    )
  }

  const note = dueNotes[currentIndex]
  const q = questions[currentQ]

  return (
    <div>
      <div className="page-header"><h1>Review</h1><p>Active recall quizzes for long-term memory</p></div>
      <div className="card" style={{ marginBottom: '1rem' }}>
        <p style={{ color: 'var(--text-muted)' }}>
          Reviewing: <strong>{note?.title}</strong> · Stage {note?.stage}/3 · Note {currentIndex + 1} of {dueNotes.length}
        </p>
      </div>

      {done ? (
        <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
          <h2>Review Complete!</h2>
          <p style={{ fontSize: '1.5rem', color: 'var(--primary)', margin: '1rem 0' }}>{score}/{total}</p>
          <p style={{ color: 'var(--text-light)' }}>Score: {total > 0 ? Math.round(score / total * 100) : 0}%</p>
          <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={nextNote}>
            {currentIndex < dueNotes.length - 1 ? 'Next Note' : 'Finish All'}
          </button>
        </div>
      ) : q ? (
        <div className="card">
          <h3 style={{ marginBottom: '0.5rem' }}>Question {currentQ + 1} of {questions.length}</h3>
          <p style={{ marginBottom: '1rem' }}>{q.question}</p>
          {q.options?.map((opt, i) => (
            <button
              key={i}
              className={`quiz-option ${selected === opt ? (opt === q.correct_answer ? 'correct' : 'wrong') : ''} ${answered && opt === q.correct_answer ? 'correct' : ''}`}
              onClick={() => handleAnswer(opt)}
            >
              {opt}
            </button>
          ))}
          {answered && (
            <div className="explanation">
              <p><strong>{selected === q.correct_answer ? '✅ Correct!' : '❌ Incorrect'}</strong></p>
              <p style={{ marginTop: '0.5rem' }}>{q.explanation}</p>
              <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={nextQuestion}>
                {currentQ < questions.length - 1 ? 'Next Question' : 'Finish Note'}
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="loading">Loading questions...</div>
      )}
    </div>
  )
}
