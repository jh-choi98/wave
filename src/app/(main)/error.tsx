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
    <div className="flex h-[100dvh] flex-col items-center justify-center gap-4 px-4 pb-16 text-center">
      <p className="text-sm text-muted-foreground">문제가 발생했습니다.</p>
      <Button onClick={reset} variant="default" size="sm">
        다시 시도
      </Button>
    </div>
  )
}
