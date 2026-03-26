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
  const token = localStorage.getItem('token')

  useEffect(() => {
    fetch('http://localhost:5000/api/sessions/my', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => {
        setSessions(Array.isArray(data) ? data : [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [token])

  // --- DELETE SINGLE SESSION ---
  const handleDelete = async (id: string) => {
    if (!window.confirm("Permanently delete this forensic record?")) return;
    
    try {
      const res = await fetch(`http://localhost:5000/api/sessions/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setSessions(prev => prev.filter(s => s._id !== id));
      }
    } catch (err) {
      console.error("Failed to delete session", err);
    }
  };

  // --- CLEAR ALL SESSIONS ---
  const handleClearAll = async () => {
    if (!window.confirm("WARNING: This will wipe your entire forensic history. Proceed?")) return;

    try {
      const res = await fetch('http://localhost:5000/api/sessions/clear-all', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setSessions([]);
      }
    } catch (err) {
      console.error("Failed to clear history", err);
    }
  };

  const totalWords = sessions.reduce((sum, s) => sum + s.wordCount, 0);
  
  const avgAuth = sessions.length > 0 
    ? Math.round(sessions.reduce((sum, s) => {
        let score = 100;
        if ((s.pasteEvents?.length || 0) > 0) score -= 40;
        return sum + score;
      }, 0) / sessions.length)
    : 0;

  if (loading) return <p style={{ color: '#fff', textAlign: 'center', marginTop: '50px' }}>Loading forensic data...</p>

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto', color: '#fff' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Forensic Session Logs</h2>
        <div style={{ display: 'flex', gap: '10px' }}>
          {sessions.length > 0 && (
            <button onClick={handleClearAll} style={{ background: 'transparent', color: '#f87171', border: '1px solid #451a1a', padding: '8px 15px', borderRadius: '5px', cursor: 'pointer', fontSize: '13px' }}>
              Clear All
            </button>
          )}
          <button onClick={() => navigate('/')} style={{ background: '#7c3aed', color: '#fff', border: 'none', padding: '8px 15px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
            + New Note
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '20px', background: '#1a1a1a', padding: '15px', borderRadius: '10px', margin: '20px 0', border: '1px solid #333' }}>
        <div>
           <small style={{ color: '#666', letterSpacing: '1px' }}>TOTAL WORDS</small>
           <div style={{ fontSize: '20px', fontWeight: 'bold' }}>{totalWords.toLocaleString()}</div>
        </div>
        <div>
           <small style={{ color: '#666', letterSpacing: '1px' }}>AVG AUTHENTICITY</small>
           <div style={{ fontSize: '20px', fontWeight: 'bold', color: avgAuth > 70 ? '#4ade80' : '#f87171' }}>
             {avgAuth}%
           </div>
        </div>
      </div>

      {sessions.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#444', marginTop: '40px' }}>No session data found.</div>
      ) : (
        sessions.map(session => (
          <div key={session._id} style={{ border: '1px solid #222', borderRadius: '10px', padding: '1.2rem', marginBottom: '1rem', background: '#141414', position: 'relative' }}>
            <button 
              onClick={() => handleDelete(session._id)}
              style={{ position: 'absolute', top: '15px', right: '15px', background: 'transparent', border: 'none', color: '#444', cursor: 'pointer', fontSize: '18px' }}
              title="Delete Session"
            >
              ×
            </button>
            <p style={{ margin: '0 0 8px 0', fontSize: '13px', color: '#888' }}>
              <strong>Date:</strong> {new Date(session.createdAt).toLocaleString()}
            </p>
            <p style={{ margin: '5px 0' }}>
              <strong>Words:</strong> {session.wordCount} | <strong>Avg Pause:</strong> {session.avgPause}ms
            </p>
            <p style={{ margin: '5px 0', color: (session.pasteEvents?.length || 0) > 0 ? '#f87171' : '#4ade80', fontSize: '13px' }}>
              <strong>Pastes:</strong> {session.pasteEvents?.length ?? 0}
            </p>
          </div>
        ))
      )}
    </div>
  )
}