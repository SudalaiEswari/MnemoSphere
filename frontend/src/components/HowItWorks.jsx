import { useState } from 'react'

const STEPS = [
  {
    icon: '📝',
    title: '1. Capture Notes',
    desc: 'Write notes manually, upload images (OCR extracts text), or use voice input. AI auto-categorizes and summarizes everything.',
    connect: 'Every note enters the 1-3-7 Review System →',
    link: '/notes',
    linkLabel: 'Go to Notes',
  },
  {
    icon: '🔄',
    title: '2. Review & Quiz',
    desc: 'AI generates quiz questions from your notes. Review on Day 1, 3, 7, 14, 30 — adaptive scheduling based on your score.',
    connect: 'Reviews build Memory Strength →',
    link: '/review',
    linkLabel: 'Go to Review',
  },
  {
    icon: '🧠',
    title: '3. Memory Twin AI',
    desc: 'Your personal AI knows what you know. Ask questions, get summaries, auto-quizzes, and daily learning plans.',
    connect: 'AI is aware of your notes, reviews, and weak spots →',
    link: '/assistant',
    linkLabel: 'Chat with AI',
  },
]

const FEATURES = [
  {
    icon: '📋',
    name: 'Tasks',
    desc: 'Track assignments with deadlines and priorities. Set due dates and mark complete.',
    remind: 'Browser notification when a task deadline is today or overdue.',
    standalone: true,
  },
  {
    icon: '✅',
    name: 'Habits',
    desc: 'Build routines with daily check-ins. Track streaks and longest streaks.',
    remind: 'Browser notification if you haven\'t checked in today by evening.',
    standalone: true,
  },
  {
    icon: '🎯',
    name: 'Goals',
    desc: 'Set long-term targets with progress percentage. Mark milestones at 25%, 50%, 75%, 100%.',
    remind: 'No automatic reminders — check the Goals page to update progress.',
    standalone: true,
  },
  {
    icon: '📊',
    name: 'Analytics',
    desc: 'View memory scores, topic strengths, weekly review charts, and weakest topics.',
    remind: 'No reminders — visit anytime to track your learning stats.',
    standalone: false,
  },
  {
    icon: '📅',
    name: 'Timeline',
    desc: 'See all your activity (notes, reviews, tasks, goals) in one chronological feed.',
    remind: 'No reminders — browse to see your full history.',
    standalone: false,
  },
  {
    icon: '📎',
    name: 'File Upload',
    desc: 'Upload images or documents. OCR extracts text, AI categorizes and summarizes automatically.',
    remind: 'No reminders — upload creates a note directly.',
    standalone: false,
  },
]

export default function HowItWorks({ show, onClose }) {
  const [tab, setTab] = useState('flow')
  if (!show) return null
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content how-it-works" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>🧠 How MnemoSphere Works</h2>
          <button className="btn-close" onClick={onClose}>✕</button>
        </div>

        <div className="tabs" style={{ marginBottom: '1.5rem' }}>
          <button className={`tab ${tab === 'flow' ? 'active' : ''}`} onClick={() => setTab('flow')}>Core Flow</button>
          <button className={`tab ${tab === 'features' ? 'active' : ''}`} onClick={() => setTab('features')}>All Features</button>
          <button className={`tab ${tab === 'reminders' ? 'active' : ''}`} onClick={() => setTab('reminders')}>Reminders</button>
        </div>

        {tab === 'flow' && (
          <div className="how-flow">
            {STEPS.map((step, i) => (
              <div key={i} className="how-step">
                <div className="how-step-icon">{step.icon}</div>
                <div className="how-step-body">
                  <h3>{step.title}</h3>
                  <p>{step.desc}</p>
                  <div className="how-connect">
                    <span className="how-arrow">{step.connect}</span>
                    <a href={step.link} className="btn btn-primary btn-xs">{step.linkLabel}</a>
                  </div>
                </div>
              </div>
            ))}
            <div className="how-step" style={{ opacity: 0.6 }}>
              <div className="how-step-icon">🎉</div>
              <div className="how-step-body">
                <h3>4. Stronger Memory</h3>
                <p>As you review and score well, memory strength grows. Weak topics are flagged for extra attention. You never forget what matters.</p>
              </div>
            </div>
          </div>
        )}

        {tab === 'features' && (
          <div className="how-features">
            <p style={{ color: 'var(--text-muted)', marginBottom: '1rem', fontSize: '0.9rem' }}>
              Features that connect to the memory system vs standalone trackers:
            </p>
            <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))' }}>
              {FEATURES.map((f, i) => (
                <div key={i} className={`card feature-card-sm ${f.standalone ? '' : 'connected'}`}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '1.5rem' }}>{f.icon}</span>
                    {f.standalone ? (
                      <span className="tag" style={{ background: 'rgba(255,209,102,0.1)', color: 'var(--warning)' }}>Standalone</span>
                    ) : (
                      <span className="tag" style={{ background: 'rgba(6,214,160,0.1)', color: 'var(--success)' }}>Connected</span>
                    )}
                  </div>
                  <h4 style={{ fontSize: '0.95rem', marginBottom: '0.3rem' }}>{f.name}</h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'reminders' && (
          <div>
            <div className="how-reminder-card">
              <div className="how-reminder-icon">🔔</div>
              <div>
                <h3>Two Ways to Get Reminders</h3>
                <p><strong>1. In-App Toasts</strong> — colored popups appear in the top-right corner of the app (works always).<br/>
                <strong>2. Browser Notifications</strong> — system notifications even when you're on another tab. Allow when prompted.</p>
              </div>
            </div>
            <div className="how-reminder-card">
              <div className="how-reminder-icon">🔄</div>
              <div>
                <h3>Due Reviews (High Priority)</h3>
                <p>Notes due for spaced repetition review. Early stages (1-3) are higher priority. Visit <strong>/review</strong> to complete quizzes.</p>
              </div>
            </div>
            <div className="how-reminder-card">
              <div className="how-reminder-icon">📋</div>
              <div>
                <h3>Overdue Tasks (High Priority)</h3>
                <p>Tasks past their deadline. Set a deadline when creating a task to enable this. Visit <strong>/tasks</strong> to manage.</p>
              </div>
            </div>
            <div className="how-reminder-card">
              <div className="how-reminder-icon">🧠</div>
              <div>
                <h3>Memory Weakening (High Priority)</h3>
                <p><strong>✨ Unique to MnemoSphere:</strong> When your memory strength for a topic drops below 40%, you get an alert. The AI notices what you're forgetting and tells you to review.</p>
              </div>
            </div>
            <div className="how-reminder-card">
              <div className="how-reminder-icon">✅</div>
              <div>
                <h3>Pending Habits (Medium Priority)</h3>
                <p>If you haven't checked in today. Visit <strong>/habits</strong> to log and keep your streak.</p>
              </div>
            </div>
            <div className="how-reminder-card">
              <div className="how-reminder-icon">🎯</div>
              <div>
                <h3>Goal Deadline Approaching (Medium Priority)</h3>
                <p>When a goal's target date is within 7 days, you get a reminder. Visit <strong>/goals</strong> to update progress.</p>
              </div>
            </div>
            <div className="how-reminder-card">
              <div className="how-reminder-icon">🔥</div>
              <div>
                <h3>Streak Milestones (Low Priority)</h3>
                <p>Every 7 days of consecutive reviews, you get a streak celebration notification.</p>
              </div>
            </div>
            <div className="how-reminder-card">
              <div className="how-reminder-icon">⏰</div>
              <div>
                <h3>How It Works</h3>
                <p>Fully automatic — no setup needed! System checks every 10 minutes. High priority reminders appear first, then medium, then low.</p>
                <ul style={{ marginTop: '0.5rem', paddingLeft: '1.25rem', color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.8 }}>
                  <li><strong>Reviews</strong> — auto-scheduled when you save a note (1-3-7-14-30 days)</li>
                  <li><strong>Memory alerts</strong> — AI detects weakening topics from quiz scores</li>
                  <li><strong>Tasks</strong> — set a deadline when creating, get reminded when overdue</li>
                  <li><strong>Habits</strong> — daily reminder if not checked in</li>
                  <li><strong>Goals</strong> — reminded when within 7 days of target date</li>
                  <li><strong>Streaks</strong> — celebrated every 7 days</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        <div className="modal-footer">
          <a href="/dashboard" className="btn btn-primary" onClick={onClose}>Got it, go to Dashboard</a>
        </div>
      </div>
    </div>
  )
}
