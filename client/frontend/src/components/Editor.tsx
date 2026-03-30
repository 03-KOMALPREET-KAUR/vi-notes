import React, { useState, useRef, useCallback } from 'react'
import { useKeystroke } from '../hooks/useKeystroke'
import { usePasteDetect } from '../hooks/usePasteDetect'
import { saveSession } from '../api/session'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import ForensicPanel from '../components/ForensicPanel'
import ThemeToggle from './ThemeToggle'

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

  const totalPastedChars = pasteEvents?.reduce((sum, p) => sum + p.charsAdded, 0) || 0
  const clampedPasted = Math.min(totalPastedChars, charCount)
  const pasteRatio = charCount > 0 ? clampedPasted / charCount : 0
  let liveScore = 100 * (1 - pasteRatio)
  if (currentWpm > 140) liveScore -= Math.min(20, (currentWpm - 140) / 2)
  if (pasteCount > 1) liveScore -= (pasteCount - 1) * 2
  liveScore = Math.max(0, Math.round(liveScore))

  const handleCheckAnalysis = () => {
    if (wordCount > 0) setShowAnalysis(true)
  }

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

  const scoreColor = liveScore > 80 ? '#4ade80' : liveScore > 50 ? '#fbbf24' : '#f87171'

  return (
    <div style={s.page}>

      {/* ── Header ── */}
      <header style={s.header}>
        <div style={s.logoWrap}>
          <span style={s.logo}>Vi-Notes</span>
          <span style={s.logoTag}>Writing Forensics</span>
        </div>
        <div style={s.right}>
          <ThemeToggle />
          <span style={s.divider} />
          <span style={s.username}>Hi, {user?.username}</span>
          <button style={s.logoutBtn} onClick={logout}>Logout</button>
          <button style={s.sessionBtn} onClick={() => navigate('/sessions')}>
            My Sessions
          </button>
        </div>
      </header>

      {/* ── Purple accent line ── */}
      <div style={s.accentLine} />

      {/* ── Main ── */}
      <main style={s.main}>

        {/* Banners */}
        {status === 'saved' && (
          <div style={{ ...s.banner, background: 'var(--success-bg)', border: '1px solid var(--success-border)', color: 'var(--success-text)' }}>
            ✓ Session saved successfully
          </div>
        )}
        {status === 'error' && (
          <div style={{ ...s.banner, background: 'var(--error-bg)', border: '1px solid var(--error-border)', color: 'var(--error-text)' }}>
            ✕ Failed to save. Please try again.
          </div>
        )}

        {/* ── Live score strip — only when analysis is open ── */}
        {showAnalysis && wordCount > 0 && (
          <div style={s.scoreStrip}>
            <div style={s.scoreStripLeft}>
              <span style={s.scoreStripLabel}>LIVE AUTHENTICITY</span>
              <span style={{ ...s.scoreStripValue, color: scoreColor }}>{liveScore}%</span>
              <span style={{
                fontSize: 10, fontWeight: 700, letterSpacing: '0.5px',
                padding: '3px 10px', borderRadius: 20,
                fontFamily: '-apple-system, sans-serif',
                background: liveScore > 80 ? 'var(--success-bg)' : liveScore > 50 ? '#fffbeb' : 'var(--error-bg)',
                color: liveScore > 80 ? 'var(--success-text)' : liveScore > 50 ? '#92400e' : 'var(--error-text)',
                border: `1px solid ${liveScore > 80 ? 'var(--success-border)' : liveScore > 50 ? '#fde68a' : 'var(--error-border)'}`,
              }}>
                {liveScore > 80 ? 'LIKELY HUMAN' : liveScore > 50 ? 'MIXED SIGNALS' : 'LIKELY PASTED'}
              </span>
            </div>
            <div style={s.scoreStripRight}>
              <div style={s.stripStat}>
                <span style={s.stripStatLabel}>WPM</span>
                <span style={s.stripStatVal}>{currentWpm}</span>
              </div>
              <div style={s.stripDivider} />
              <div style={s.stripStat}>
                <span style={s.stripStatLabel}>AVG PAUSE</span>
                <span style={s.stripStatVal}>{avgPause}ms</span>
              </div>
              <div style={s.stripDivider} />
              <div style={s.stripStat}>
                <span style={s.stripStatLabel}>PASTES</span>
                <span style={{ ...s.stripStatVal, color: pasteCount > 0 ? '#f87171' : 'var(--text-primary)' }}>
                  {pasteCount}
                </span>
              </div>
              <button
                style={s.stripClose}
                onClick={() => setShowAnalysis(false)}
                title="Close analysis"
              >×</button>
            </div>
          </div>
        )}

        {/* ── Editor area ── */}
        <div style={s.editorWrap}>
          <textarea
            style={s.textarea}
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            placeholder="Begin writing. Your session is recorded silently…"
            spellCheck
          />
        </div>

        {/* ── Footer bar ── */}
        <div style={s.footer}>
          {/* Chiclets */}
          <div style={s.chiclets}>
            <div style={s.chiclet}>
              <div style={s.chicletLabel}>WORDS</div>
              <div style={s.chicletValue}>{wordCount.toLocaleString()}</div>
            </div>
            <div style={s.chiclet}>
              <div style={s.chicletLabel}>CHARACTERS</div>
              <div style={s.chicletValue}>{charCount.toLocaleString()}</div>
            </div>
            {showAnalysis && wordCount > 0 && (
              <div style={{ ...s.chiclet, borderColor: scoreColor }}>
                <div style={s.chicletLabel}>SCORE</div>
                <div style={{ ...s.chicletValue, color: scoreColor }}>{liveScore}%</div>
              </div>
            )}
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            {!showAnalysis && (
              <button
                style={{
                  ...s.checkBtn,
                  opacity: wordCount === 0 ? 0.35 : 1,
                  cursor: wordCount === 0 ? 'not-allowed' : 'pointer',
                }}
                onClick={handleCheckAnalysis}
                disabled={wordCount === 0}
              >
                CHECK AUTHENTICITY
              </button>
            )}
            <button
              style={{
                ...s.endBtn,
                opacity: text.trim() === '' || status === 'saving' ? 0.4 : 1,
                cursor: text.trim() === '' || status === 'saving' ? 'not-allowed' : 'pointer',
              }}
              onClick={handleEndSession}
              disabled={text.trim() === '' || status === 'saving'}
            >
              {status === 'saving' ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={s.spinner} /> Saving…
                </span>
              ) : 'End session'}
            </button>
          </div>
        </div>

      </main>
    </div>
  )
}

const s: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    background: 'var(--bg-page)',
    display: 'flex',
    flexDirection: 'column',
    transition: 'background 0.2s',
  },

  /* ── Header ── */
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '13px 28px',
    borderBottom: '1px solid var(--border)',
    background: 'var(--bg-card)',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  accentLine: {
    height: 2,
    background: 'linear-gradient(90deg, #7c3aed 0%, #a78bfa 60%, transparent 100%)',
    flexShrink: 0,
  },
  logoWrap: {
    display: 'flex',
    alignItems: 'baseline',
    gap: 10,
  },
  logo: {
    color: 'var(--text-primary)',
    fontSize: 17,
    fontWeight: 700,
    letterSpacing: '-0.5px',
    fontFamily: 'Georgia, serif',
  },
  logoTag: {
    fontSize: 10,
    letterSpacing: '1.5px',
    color: 'var(--text-muted)',
    fontFamily: '-apple-system, sans-serif',
    textTransform: 'uppercase' as const,
  },
  right: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  divider: {
    display: 'inline-block',
    width: 1,
    height: 16,
    background: 'var(--border)',
    margin: '0 2px',
  },
  username: {
    color: 'var(--text-secondary)',
    fontSize: 12,
    fontFamily: '-apple-system, sans-serif',
  },
  logoutBtn: {
    background: 'transparent',
    border: '1px solid var(--border)',
    color: 'var(--text-secondary)',
    borderRadius: 6,
    padding: '5px 13px',
    fontSize: 11,
    cursor: 'pointer',
    fontFamily: 'inherit',
    letterSpacing: '0.2px',
    transition: 'border-color 0.15s',
  },
  sessionBtn: {
    background: '#1a1a1a',
    border: 'none',
    color: '#ffffff',
    borderRadius: 6,
    padding: '6px 15px',
    fontSize: 11,
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: 'inherit',
    letterSpacing: '0.3px',
  },

  /* ── Main ── */
  main: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    maxWidth: 900,
    width: '100%',
    margin: '0 auto',
    padding: '28px 28px 24px',
    gap: 12,
  },
  banner: {
    borderRadius: 8,
    padding: '10px 16px',
    fontSize: 13,
    fontFamily: '-apple-system, sans-serif',
    fontWeight: 500,
  },

  /* ── Live score strip ── */
  scoreStrip: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 10,
    padding: '12px 20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 20,
  },
  scoreStripLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  scoreStripLabel: {
    fontSize: 9,
    letterSpacing: '2px',
    color: 'var(--text-muted)',
    fontFamily: '-apple-system, sans-serif',
  },
  scoreStripValue: {
    fontSize: 26,
    fontWeight: 700,
    fontFamily: 'Georgia, serif',
    lineHeight: 1,
  },
  scoreStripRight: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
  },
  stripStat: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 2,
  },
  stripStatLabel: {
    fontSize: 8,
    letterSpacing: '1.5px',
    color: 'var(--text-muted)',
    fontFamily: '-apple-system, sans-serif',
  },
  stripStatVal: {
    fontSize: 15,
    fontWeight: 600,
    color: 'var(--text-primary)',
    fontFamily: 'Georgia, serif',
  },
  stripDivider: {
    width: 1,
    height: 28,
    background: 'var(--border)',
  },
  stripClose: {
    background: 'transparent',
    border: 'none',
    color: 'var(--text-muted)',
    fontSize: 18,
    cursor: 'pointer',
    padding: '0 4px',
    marginLeft: 4,
    lineHeight: 1,
    fontFamily: 'inherit',
  },

  /* ── Textarea ── */
  editorWrap: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  textarea: {
    flex: 1,
    minHeight: 460,
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 12,
    padding: '32px 36px',
    color: 'var(--textarea-text)',
    fontSize: 16,
    lineHeight: 1.95,
    resize: 'none',
    outline: 'none',
    fontFamily: 'Georgia, serif',
    transition: 'background 0.2s, color 0.2s, border-color 0.15s',
  },

  /* ── Footer ── */
  footer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 4,
  },
  chiclets: {
    display: 'flex',
    gap: 8,
  },
  chiclet: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 8,
    padding: '7px 14px',
    transition: 'border-color 0.2s',
  },
  chicletLabel: {
    fontSize: 8,
    letterSpacing: '1.5px',
    color: 'var(--text-muted)',
    marginBottom: 3,
    fontFamily: '-apple-system, sans-serif',
  },
  chicletValue: {
    fontSize: 17,
    fontWeight: 700,
    color: 'var(--text-primary)',
    fontFamily: 'Georgia, serif',
    lineHeight: 1,
    transition: 'color 0.2s',
  },

  /* ── Buttons ── */
  checkBtn: {
    background: 'transparent',
    border: '1px solid var(--border)',
    color: 'var(--text-secondary)',
    borderRadius: 8,
    padding: '9px 16px',
    fontSize: 10,
    fontWeight: 700,
    cursor: 'pointer',
    fontFamily: 'inherit',
    letterSpacing: '1px',
    transition: 'opacity 0.15s',
  },
  endBtn: {
    background: 'var(--accent)',
    color: 'var(--accent-text)',
    border: 'none',
    borderRadius: 8,
    padding: '9px 24px',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'opacity 0.2s',
    fontFamily: 'inherit',
    display: 'flex',
    alignItems: 'center',
  },
  spinner: {
    display: 'inline-block',
    width: 10,
    height: 10,
    border: '2px solid rgba(255,255,255,0.3)',
    borderTopColor: '#fff',
    borderRadius: '50%',
    animation: 'spin 0.7s linear infinite',
  },
}

export default Editor