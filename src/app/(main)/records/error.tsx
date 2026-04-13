'use client'

import { Button } from '@/components/ui/button'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 px-4 py-16 text-center">
      <p className="text-sm text-muted-foreground">기록을 불러오지 못했습니다.</p>
      <Button onClick={reset} variant="default" size="sm">
        다시 시도
      </Button>
    </div>
  )
}
