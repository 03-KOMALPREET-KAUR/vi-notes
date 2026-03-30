export const saveSession = async (data: {
  text: string
  wordCount: number
  charCount: number
  duration: number
  keystrokeTimings: number[]
  avgPause: number
  pasteEvents: { at: number; charsAdded: number }[]
  pasteCount: number
  startTime: Date
  endTime: Date
}, token: string) => {
  const res = await fetch('http://localhost:5000/api/sessions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Failed to save session')
  return res.json()
}