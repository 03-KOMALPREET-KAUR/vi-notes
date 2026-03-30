import { useRef, useCallback } from 'react'

interface PasteEvent {
  at: number
  charsAdded: number
}



export const usePasteDetect = () => {
  const pasteEvents = useRef<PasteEvent[]>([])

  const handlePaste = useCallback((e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const pasted = e.clipboardData.getData('text')
    pasteEvents.current.push({ at: Date.now(), charsAdded: pasted.length })
  }, [])

  const getPasteData = useCallback(() => ({
    pasteEvents: pasteEvents.current,
    pasteCount: pasteEvents.current.length,
  }), [])

  const reset = useCallback(() => {
    pasteEvents.current = []
  }, [])

  return { handlePaste, getPasteData, reset }
}

