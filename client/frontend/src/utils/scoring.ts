interface PasteEvent {
  at: number
  charsAdded: number
}

interface SessionLike {
  charCount: number
  pasteCount: number
  pasteEvents?: PasteEvent[]
}

export const getTotalPastedChars = (sess: SessionLike): number => {
  const raw = sess.pasteEvents?.reduce((sum, p) => sum + p.charsAdded, 0) || 0
  return Math.min(raw, sess.charCount)
}

export const getPastePercentage = (sess: SessionLike): number => {
  if (sess.charCount === 0) return 0
  const pasted = getTotalPastedChars(sess)
  return Math.round((pasted / sess.charCount) * 100)
}

export const calculateAuthenticityScore = (
  sess: SessionLike,
  wpm = 0
): number => {
  if (sess.charCount === 0) return 100

  const pasted = getTotalPastedChars(sess)
  const pasteRatio = pasted / sess.charCount

  let score = 100 * (1 - pasteRatio)


  if (wpm > 140) score -= Math.min(20, (wpm - 140) / 2)

  // Small penalty per additional paste event beyond the first
  if (sess.pasteCount > 1) score -= (sess.pasteCount - 1) * 2

  return Math.min(100, Math.max(0, Math.round(score)))
}

export const getScoreColor = (score: number): string =>
  score > 80 ? '#4ade80' : score > 50 ? '#fbbf24' : '#f87171'

export const getScoreVerdict = (score: number): string =>
  score > 80 ? 'LIKELY HUMAN' : score > 50 ? 'MIXED SIGNALS' : 'LIKELY PASTED'

export const getScoreBadgeStyle = (score: number) => ({
  bg:     score > 80 ? 'var(--success-bg)'     : score > 50 ? '#fffbeb'              : 'var(--error-bg)',
  text:   score > 80 ? 'var(--success-text)'   : score > 50 ? '#92400e'              : 'var(--error-text)',
  border: score > 80 ? 'var(--success-border)' : score > 50 ? '#fde68a'              : 'var(--error-border)',
})