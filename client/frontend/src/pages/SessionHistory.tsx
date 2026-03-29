import { useEffect, useState } from 'react' 
import { useNavigate } from "react-router-dom"

interface PasteEvent {
  at: number
  charsAdded: number
}

interface Session {
  _id: string
  text?: string 
  createdAt: string
  wordCount: number
  charCount: number
  avgPause: number
  pasteCount: number
  pasteEvents?: PasteEvent[]
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

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); 
    if (!window.confirm("Permanently delete this forensic record?")) return;
    try {
      const res = await fetch(`http://localhost:5000/api/sessions/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setSessions(prev => prev.filter(s => s._id !== id));
    } catch (err) { console.error(err); }
  };

  const handleClearAll = async () => {
    if (!window.confirm("This will permanently wipe ALL forensic history. Proceed?")) return;
    try {
      const res = await fetch('http://localhost:5000/api/sessions/clear-all', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setSessions([]);
    } catch (err) { console.error(err); }
  };

  if (loading) return <p style={sh.loading}>Loading archive...</p>

  return (
    <div style={sh.page}>
      <header style={sh.header}>
        <div>
          <h2 style={sh.title}>SESSION ARCHIVE</h2>
          <p style={sh.subtitle}>{sessions.length} sessions captured</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          {sessions.length > 0 && (
            <button onClick={handleClearAll} style={sh.clearBtn}>Clear All</button>
          )}
          <button onClick={() => navigate('/')} style={sh.newBtn}>+ New Session</button>
        </div>
      </header>

      <div style={sh.grid}>
        {sessions.length === 0 ? (
          <div style={{ color: '#444', gridColumn: '1/-1', textAlign: 'center', marginTop: '40px' }}>
            No forensic data available. Start a new session to begin monitoring.
          </div>
        ) : (
          sessions.map(s => {
            const totalPastedChars = s.pasteEvents?.reduce((sum, p) => sum + p.charsAdded, 0) || 0;
            const pasteRatio = s.charCount > 0 ? totalPastedChars / s.charCount : 0;
            
            let cardScore = 100 * (1 - pasteRatio);
            if (s.pasteCount > 1) cardScore -= (s.pasteCount - 1) * 2;
            
            const finalScore = Math.min(100, Math.max(0, Math.round(cardScore)));
            const scoreColor = finalScore > 80 ? '#4ade80' : finalScore > 50 ? '#fbbf24' : '#f87171';

            return (
              <div key={s._id} style={sh.card} onClick={() => navigate(`/sessions/${s._id}`)}>
                <div style={sh.cardTop}>
                  <span style={sh.date}>{new Date(s.createdAt).toLocaleDateString()}</span>
                  <button style={sh.delBtn} onClick={(e) => handleDelete(s._id, e)}>×</button>
                </div>

                <div style={sh.statsRow}>
                  <span style={{...sh.statBadge, color: scoreColor, borderColor: scoreColor }}>
                    {finalScore}% Human
                  </span>
                  <span style={sh.statBadge}>{s.wordCount} words</span>
                  {s.pasteCount > 0 && (
                     <span style={{...sh.statBadge, color: '#f87171'}}>{s.pasteCount} pastes</span>
                  )}
                </div>

                <p style={sh.preview}>
                  {s.text ? s.text.substring(0, 85) + "..." : "No text content available."}
                </p>

                <div style={sh.cardFooter}>
                  View Full Analysis →
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}


const sh: Record<string, React.CSSProperties> = {
  page: { padding: '60px 40px', maxWidth: '900px', margin: '0 auto', color: '#fff', minHeight: '100vh' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '50px' },
  title: { fontSize: '32px', fontWeight: 800, margin: 0, letterSpacing: '-0.5px' },
  subtitle: { color: '#555', fontSize: '14px', margin: '5px 0 0 0', fontWeight: 600 },
  loading: { color: '#555', textAlign: 'center', marginTop: '100px', fontSize: '14px', fontWeight: 600 },
  newBtn: { background: '#7c3aed', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '13px' },
  clearBtn: { background: 'transparent', color: '#f87171', border: '1px solid #331a1a', padding: '12px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '13px' },
  
  grid: { display: 'grid', gridTemplateColumns: '1fr', gap: '16px' },
 
  card: { background: '#111', border: '1px solid #1a1a1a', borderRadius: '12px', padding: '20px', cursor: 'pointer', transition: 'all 0.2s ease', position: 'relative' },
  
  cardTop: { display: 'flex', justifyContent: 'space-between', marginBottom: '12px' },
  date: { fontSize: '11px', color: '#444', fontWeight: 800, letterSpacing: '1px' },
  delBtn: { background: 'transparent', border: 'none', color: '#333', fontSize: '18px', cursor: 'pointer' },
  statsRow: { display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' },
  statBadge: { fontSize: '10px', fontWeight: 800, border: '1px solid #222', padding: '4px 10px', borderRadius: '6px', color: '#777', textTransform: 'uppercase' },
  
  preview: { 
    fontSize: '14px', 
    color: '#666', 
    lineHeight: '1.5', 
    margin: 0,
    overflow: 'hidden',
    display: '-webkit-box',
    WebkitLineClamp: 2, 
    WebkitBoxOrient: 'vertical',
    textOverflow: 'ellipsis'
  },
  
  cardFooter: { marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #1a1a1a', fontSize: '11px', color: '#7c3aed', fontWeight: 700 }
}