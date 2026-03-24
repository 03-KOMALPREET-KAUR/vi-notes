import { useEffect, useState } from 'react'
import { useNavigate } from "react-router-dom"

interface Session {
  _id: string
  createdAt: string
  wordCount: number
  charCount: number
  duration: number
  avgPause: number
  pasteEvents: { charsAdded: number }[]
}

export default function SessionHistory() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem('token')
    console.log("TOKEN:", token)

    fetch('http://localhost:5000/api/sessions/my', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => {
        console.log("DATA:", data)
        setSessions(Array.isArray(data) ? data : [])
        setLoading(false)
      })
      .catch((err) => {
        console.error(err)
        setLoading(false)
      })
  }, [])

  if (loading) return <p style={{ color: '#fff' }}>Loading sessions...</p>
  if (sessions.length === 0) return <p style={{ color: '#fff' }}>No sessions yet. Go write something!</p>

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      
      
      <h2 style={{ color: '#fff', marginBottom: '20px' }}>
        Your writing sessions
      </h2>

      {sessions.map(session => {
        const minutes = Math.floor(session.duration / 60000)
        const seconds = Math.floor((session.duration % 60000) / 1000)

        return (
          <div key={session._id} style={{
            border: '1px solid #333',
            borderRadius: '10px',
            padding: '1rem',
            marginBottom: '1rem',
            background: '#181818',   // 🔥 FIX
            color: '#e5e5e5',        // 🔥 FIX
          }}>
            <p><strong>Date:</strong> {new Date(session.createdAt).toLocaleString()}</p>

            <p>
              <strong>Words:</strong> {session.wordCount} &nbsp;
              <strong>Chars:</strong> {session.charCount}
            </p>

            <p><strong>Duration:</strong> {minutes}m {seconds}s</p>

            <p><strong>Avg pause:</strong> {session.avgPause} ms</p>

            <p><strong>Paste events:</strong> {session.pasteEvents?.length ?? 0}</p>
          </div>
        )
      })}
    </div>
  )
}