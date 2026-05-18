'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

export type Draft = {
  book: string
  chapter: number
  content: string
}

function getKey(userId: string, date: string): string {
  return `draft_${userId}_${date}`
}

export function useDraft(
  userId: string,
  date: string
): {
  draft: Draft | null
  saveDraft: (draft: Draft) => void
  clearDraft: () => void
} {
  const [draft, setDraft] = useState<Draft | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const key = getKey(userId, date)

  // Restore on mount
  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const raw = window.localStorage.getItem(key)
      if (raw) {
        setDraft(JSON.parse(raw) as Draft)
      } else {
        setDraft(null)
      }
    } catch {
      setDraft(null)
    }
  }, [key])

  const saveDraft = useCallback(
    (next: Draft) => {
      if (typeof window === 'undefined') return
      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => {
        try {
          window.localStorage.setItem(key, JSON.stringify(next))
        } catch {
          // ignore quota / availability errors
        }
      }, 300)
    },
    [key]
  )

  const clearDraft = useCallback(() => {
    if (typeof window === 'undefined') return
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
    try {
      window.localStorage.removeItem(key)
    } catch {
      // ignore
    }
    setDraft(null)
  }, [key])

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  return { draft, saveDraft, clearDraft }
}
