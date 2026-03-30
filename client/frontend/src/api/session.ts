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
  const API = import.meta.env.VITE_API_URL;

  const res = await fetch(`${API}/api/sessions`, {
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