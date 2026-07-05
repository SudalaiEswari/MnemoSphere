import { useEffect, useRef } from 'react'
import axios from 'axios'
import { useToast } from './Toast'

const CHECK_INTERVAL = 600000

function sendBrowserNotification(title, body, tag) {
  if (!('Notification' in window)) return
  if (Notification.permission !== 'granted') return
  try {
    new Notification(title, { body, tag, icon: '/icons/icon-192.png' })
  } catch (e) {
  }
}

export default function ReminderService({ token, enabled }) {
  const addToast = useToast()
  const intervalRef = useRef(null)
  const lastNotifiedRef = useRef({})

  useEffect(() => {
    if (!token || !enabled) return

    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }

    const check = async () => {
      try {
        const now = Date.now()

        const res = await axios.get('/api/reminders/smart', { params: { token } }).catch(() => null)
        if (!res?.data?.length) return

        const grouped = { high: [], medium: [], low: [] }
        for (const r of res.data) {
          grouped[r.priority]?.push(r)
        }

        const send = (reminders) => {
          for (const r of reminders) {
            const dedupKey = `${r.type}-${r.note_id || r.task_id || r.habit_id || r.goal_id || r.topic || 'gen'}`
            if (lastNotifiedRef.current[dedupKey] > now - CHECK_INTERVAL) continue
            lastNotifiedRef.current[dedupKey] = now

            addToast(`${r.title}: ${r.body}`, r.type, 8000)
            sendBrowserNotification(r.title, r.body, r.type)
          }
        }

        send(grouped.high)
        setTimeout(() => send(grouped.medium), 1000)
        setTimeout(() => send(grouped.low), 2000)
      } catch (e) {
      }
    }

    check()
    intervalRef.current = setInterval(check, CHECK_INTERVAL)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [token, enabled, addToast])

  return null
}
