import React, { useState, useRef, useCallback } from 'react'
import { useKeystroke } from '../hooks/useKeystroke'
import { usePasteDetect } from '../hooks/usePasteDetect'
import { saveSession } from '../api/session'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import ForensicPanel from '../components/ForensicPanel' 

const Editor: React.FC = () => {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [text, setText] = useState('')
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [showAnalysis, setShowAnalysis] = useState(false) 
  const startTime = useRef<Date>(new Date())

  const { handleKeyDown, getKeystrokeData, reset: resetKeys } = useKeystroke()
  const { handlePaste, getPasteData, reset: resetPaste } = usePasteDetect()

  const { avgPause } = getKeystrokeData()
  const { pasteCount, pasteEvents } = getPasteData()
  
  const wordCount = text.trim() === '' ? 0 : text.trim().split(/\s+/).length
  const charCount = text.length

  const minutesElapsed = (new Date().getTime() - startTime.current.getTime()) / 60000
  const currentWpm = minutesElapsed > 0 ? Math.round(wordCount / minutesElapsed) : 0

  const handleCheckAnalysis = () => {
    if (wordCount > 0) setShowAnalysis(true);
  }

  const totalPastedChars = pasteEvents?.reduce((sum, p) => sum + p.charsAdded, 0) || 0;
  const pasteRatio = charCount > 0 ? totalPastedChars / charCount : 0;
  
  let liveScore = 100 * (1 - pasteRatio);
  if (currentWpm > 140) liveScore -= Math.min(20, (currentWpm - 140) / 2);
  if (pasteCount > 1) liveScore -= (pasteCount - 1) * 2;
  liveScore = Math.max(0, Math.round(liveScore));

  const handleEndSession = useCallback(async () => {
    if (!user || text.trim() === '') return
    setStatus('saving')
    const endTime = new Date()
    const { timings, avgPause } = getKeystrokeData()
    const { pasteEvents, pasteCount } = getPasteData()

    try {
      await saveSession({
        text, 
        wordCount,
        charCount,
        duration: endTime.getTime() - startTime.current.getTime(),
        keystrokeTimings: timings,
        avgPause,
        pasteEvents,
        pasteCount,
        startTime: startTime.current,
        endTime,
      }, user.token)

      setStatus('saved')
      resetKeys()
      resetPaste()
      setText('')
      setShowAnalysis(false)
      startTime.current = new Date()
      setTimeout(() => setStatus('idle'), 3000)
    } catch {
      setStatus('error')
      setTimeout(() => setStatus('idle'), 3000)
    }
  }, [user, text, wordCount, charCount, getKeystrokeData, getPasteData, resetKeys, resetPaste])

  return (
    <div style={s.page}>
      <header style={s.header}>
        <span style={s.logo}>Vi-Notes</span>
        <div style={s.right}>
          <span style={s.username}>Hi, {user?.username}</span>
          <button style={s.logoutBtn} onClick={logout}>Logout</button>
          <button style={s.sessionBtn} onClick={() => navigate('/sessions')}>My sessions</button>
        </div>
      </header>

      <main style={s.mainContainer}>
        <div style={s.editorWrapper}>
          {status === 'saved' && <div style={s.banner}>Session saved successfully!</div>}
          {status === 'error' && <div style={{ ...s.banner, ...s.bannerErr }}>Failed to save. Try again.</div>}

          <div style={{ display: 'flex', gap: '20px', flex: 1 }}>
            <textarea
              style={s.textarea}
              value={text}
              onChange={e => {
                setText(e.target.value);
                if(showAnalysis) setShowAnalysis(false); 
              }}
              onKeyDown={handleKeyDown}
              onPaste={handlePaste}
              placeholder="Start writing here. Your session is being monitored silently..."
              spellCheck
            />
            
            <ForensicPanel 
              wpm={currentWpm}
              pasteCount={pasteCount}
              avgPause={avgPause}
              isPasting={false}
              isVisible={showAnalysis && wordCount > 0}
              customScore={liveScore} 
            />
          </div>

          <div style={s.footer}>
            <div style={s.stats}>
              <span style={s.stat}>{wordCount} words</span>
              <span style={s.dot}>·</span>
              <span style={s.stat}>{charCount} characters</span>
            </div>
            
            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                style={s.checkBtn} 
                onClick={handleCheckAnalysis}
                disabled={wordCount === 0}
              >
                CHECK AUTHENTICITY
              </button>
              
              <button
                style={{ ...s.endBtn, opacity: text.trim() === '' || status === 'saving' ? 0.4 : 1 }}
                onClick={handleEndSession}
                disabled={text.trim() === '' || status === 'saving'}
              >
                {status === 'saving' ? 'Saving...' : 'End session'}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

const s: Record<string, React.CSSProperties> = {
  page: { minHeight: '100vh', background: '#0f0f0f', display: 'flex', flexDirection: 'column' },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 32px', borderBottom: '1px solid #1a1a1a' },
  logo: { color: '#fff', fontSize: 17, fontWeight: 700, letterSpacing: '-0.3px' },
  right: { display: 'flex', alignItems: 'center', gap: 16 },
  username: { color: '#555', fontSize: 13 },
  logoutBtn: { background: 'transparent', border: '1px solid #222', color: '#666', borderRadius: 6, padding: '5px 13px', fontSize: 12, cursor: 'pointer' },
  sessionBtn: { background: '#222', color: '#eee', border: 'none', borderRadius: 6, padding: '6px 14px', fontSize: 12, cursor: 'pointer' },
  mainContainer: { flex: 1, display: 'flex', justifyContent: 'center', padding: '36px 24px' },
  editorWrapper: { maxWidth: 1100, width: '100%', display: 'flex', flexDirection: 'column', gap: 14 },
  banner: { background: '#0d2818', border: '1px solid #14532d', color: '#86efac', borderRadius: 8, padding: '10px 16px', fontSize: 13 },
  bannerErr: { background: '#1f0d0d', border: '1px solid #3f1515', color: '#f87171' },
  textarea: { flex: 1, minHeight: 520, background: '#111', border: '1px solid #1e1e1e', borderRadius: 10, padding: '28px 32px', color: '#d4d4d4', fontSize: 16, lineHeight: 1.85, resize: 'none', outline: 'none', fontFamily: 'Georgia, serif' },
  footer: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  stats: { display: 'flex', gap: 8, alignItems: 'center' },
  stat: { color: '#444', fontSize: 13 },
  dot: { color: '#333', fontSize: 13 },
  checkBtn: { background: 'transparent', color: '#7c3aed', border: '1px solid #7c3aed', borderRadius: 8, padding: '9px 18px', fontSize: 13, cursor: 'pointer' },
  endBtn: { background: '#7c3aed', color: '#fff', border: 'none', borderRadius: 8, padding: '9px 22px', fontSize: 13, fontWeight: 500, cursor: 'pointer', transition: 'opacity .2s' },
}

export default Editor