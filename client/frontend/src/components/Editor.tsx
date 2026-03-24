import React, { useState, useRef, useCallback } from 'react'
import { useKeystroke } from '../hooks/useKeystroke'
import { usePasteDetect } from '../hooks/usePasteDetect'
import { saveSession } from '../api/session'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

const Editor: React.FC = () => {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [text, setText] = useState('')
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const startTime = useRef<Date>(new Date())

  const { handleKeyDown, getKeystrokeData, reset: resetKeys } = useKeystroke()
  const { handlePaste, getPasteData, reset: resetPaste } = usePasteDetect()

  const wordCount = text.trim() === '' ? 0 : text.trim().split(/\s+/).length
  const charCount = text.length

  const handleEndSession = useCallback(async () => {
    if (!user || text.trim() === '') return
    setStatus('saving')
    const endTime = new Date()
    const { timings, avgPause } = getKeystrokeData()
    const { pasteEvents, pasteCount } = getPasteData()

    try {
      await saveSession({
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
          <button onClick={() => navigate('/sessions')}>My sessions</button>
        </div>
      </header>

      <main style={s.main}>
        {status === 'saved' && <div style={s.banner}>Session saved successfully!</div>}
        {status === 'error' && <div style={{ ...s.banner, ...s.bannerErr }}>Failed to save. Try again.</div>}

        <textarea
          style={s.textarea}
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          placeholder="Start writing here. Your session is being monitored silently..."
          spellCheck
        />

        <div style={s.footer}>
          <div style={s.stats}>
            <span style={s.stat}>{wordCount} words</span>
            <span style={s.dot}>·</span>
            <span style={s.stat}>{charCount} characters</span>
          </div>
          <button
            style={{ ...s.endBtn, opacity: text.trim() === '' || status === 'saving' ? 0.4 : 1 }}
            onClick={handleEndSession}
            disabled={text.trim() === '' || status === 'saving'}
          >
            {status === 'saving' ? 'Saving...' : 'End session'}
          </button>
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
  main: { flex: 1, display: 'flex', flexDirection: 'column', maxWidth: 820, width: '100%', margin: '0 auto', padding: '36px 24px', gap: 14 },
  banner: { background: '#0d2818', border: '1px solid #14532d', color: '#86efac', borderRadius: 8, padding: '10px 16px', fontSize: 13 },
  bannerErr: { background: '#1f0d0d', border: '1px solid #3f1515', color: '#f87171' },
  textarea: { flex: 1, minHeight: 520, background: '#111', border: '1px solid #1e1e1e', borderRadius: 10, padding: '28px 32px', color: '#d4d4d4', fontSize: 16, lineHeight: 1.85, resize: 'none', outline: 'none', fontFamily: 'Georgia, serif' },
  footer: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  stats: { display: 'flex', gap: 8, alignItems: 'center' },
  stat: { color: '#444', fontSize: 13 },
  dot: { color: '#333', fontSize: 13 },
  endBtn: { background: '#7c3aed', color: '#fff', border: 'none', borderRadius: 8, padding: '9px 22px', fontSize: 13, fontWeight: 500, cursor: 'pointer', transition: 'opacity .2s' },
}

export default Editor