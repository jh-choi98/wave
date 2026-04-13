'use client'

import { useEffect, useState } from 'react'
import { X } from 'lucide-react'

const STORAGE_KEY = 'wave_onboarded'

export function OnboardingBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      if (!window.localStorage.getItem(STORAGE_KEY)) {
        setVisible(true)
      }
    } catch {
      // ignore
    }
  }, [])

  if (!visible) return null

  const dismiss = () => {
    try {
      window.localStorage.setItem(STORAGE_KEY, 'true')
    } catch {
      // ignore
    }
    setVisible(false)
  }

  return (
    <div className="flex items-center justify-between gap-2 border-b bg-primary/5 px-4 py-2 text-xs text-foreground">
      <span>첫 번째 본문은 창세기 1장입니다</span>
      <button
        type="button"
        onClick={dismiss}
        aria-label="배너 닫기"
        className="rounded p-0.5 text-muted-foreground hover:text-foreground"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}
