import { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react'

const ToastContext = createContext()

export function useToast() {
  return useContext(ToastContext)
}

const ICONS = {
  info: '💡',
  review: '🔄',
  task: '📋',
  habit: '✅',
  goal: '🎯',
  memory: '🧠',
  streak: '🔥',
  warning: '⚠️',
  success: '🎉',
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const idRef = useRef(0)

  const addToast = useCallback((message, type = 'info', duration = 6000) => {
    const id = ++idRef.current
    setToasts(prev => [...prev, { id, message, type, duration }])
  }, [])

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={addToast}>
      {children}
      <div className="toast-container">
        {toasts.map(t => (
          <ToastItem key={t.id} toast={t} onClose={() => removeToast(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

function ToastItem({ toast, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, toast.duration)
    return () => clearTimeout(timer)
  }, [toast.duration, onClose])

  return (
    <div className={`toast toast-${toast.type}`} onClick={onClose}>
      <span className="toast-icon">{ICONS[toast.type] || '💡'}</span>
      <span className="toast-msg">{toast.message}</span>
    </div>
  )
}
