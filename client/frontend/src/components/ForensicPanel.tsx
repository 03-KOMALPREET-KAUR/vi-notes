import React from 'react'

interface ForensicPanelProps {
  wpm: number
  pasteCount: number
  avgPause: number
  isPasting: boolean
  isVisible: boolean
  customScore: number 
}

const ForensicPanel: React.FC<ForensicPanelProps> = ({ 
  wpm, 
  pasteCount, 
  avgPause, 
  isVisible, 
  customScore 
}) => {
  if (!isVisible) return null

  const displayScore = Math.min(100, Math.max(0, customScore));
  const scoreColor = displayScore > 80 ? '#4ade80' : displayScore > 50 ? '#fbbf24' : '#f87171';

  return (
    <div style={fp.container}>
      <span style={fp.label}>ANALYSIS</span>

      <div style={fp.section}>
        <span style={fp.subLabel}>AUTHENTICITY SCORE</span>
        <div style={{ ...fp.score, color: scoreColor }}>{displayScore}%</div>
      </div>

      <div style={fp.section}>
        <span style={fp.subLabel}>WPM</span>
        <div style={fp.val}>{wpm}</div>
      </div>

      <div style={fp.section}>
        <span style={fp.subLabel}>PASTES</span>
        <div style={{ ...fp.val, color: pasteCount > 0 ? '#f87171' : '#555' }}>{pasteCount}</div>
      </div>

      <div style={fp.section}>
        <span style={fp.subLabel}>AVERAGE PAUSE</span>
        <div style={fp.val}>{avgPause}ms</div>
      </div>
    </div>
  )
}

const fp: Record<string, React.CSSProperties> = {
  container: { 
    width: 280, 
    background: '#111', 
    borderLeft: '1px solid #1a1a1a', 
    padding: '30px', 
    display: 'flex', 
    flexDirection: 'column', 
    gap: '35px',
    fontFamily: 'Inter, system-ui, sans-serif'
  },
  label: { fontSize: '11px', color: '#555', fontWeight: 800, letterSpacing: '1.5px' },
  section: { display: 'flex', flexDirection: 'column', gap: '8px' },
  subLabel: { fontSize: '9px', color: '#444', fontWeight: 700, letterSpacing: '0.5px' },
  score: { fontSize: '42px', fontWeight: 900, letterSpacing: '-1px' },
  status: { fontSize: '10px', fontWeight: 800, marginTop: '-5px' },
  val: { fontSize: '22px', color: '#eee', fontWeight: 600 },
}

export default ForensicPanel