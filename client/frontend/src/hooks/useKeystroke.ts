import { useRef, useCallback } from 'react'

export const useKeystroke = () => {
  const timings = useRef<number[]>([])
  const lastKeyTime = useRef<number | null>(null)

  const handleKeyDown = useCallback(() => {
    const now = Date.now()
    if (lastKeyTime.current !== null) {
      timings.current.push(now - lastKeyTime.current)
    }
    lastKeyTime.current = now
  }, [])

  const getKeystrokeData = useCallback(() => {
    const t = timings.current
    const avg = t.length > 0
      ? Math.round(t.reduce((a, b) => a + b, 0) / t.length)
      : 0
    return { timings: t, avgPause: avg }
  }, [])

  const reset = useCallback(() => {
    timings.current = []
    lastKeyTime.current = null
  }, [])

  return { handleKeyDown, getKeystrokeData, reset }
}