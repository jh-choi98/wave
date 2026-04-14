import type { ReactNode } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Verse } from '@/lib/bible/client'

export type BiblePassageProps = {
  book: string
  chapter: number
  verses: Verse[]
  action?: ReactNode
  onPrev?: () => void
  onNext?: () => void
  isPending?: boolean
}

export function BiblePassage({ book, chapter, verses, action, onPrev, onNext, isPending }: BiblePassageProps) {
  return (
    <section className="flex-1 overflow-y-auto px-4 py-3">
      <header className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onPrev}
            disabled={isPending}
            aria-label="이전 장"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h2 className="text-lg font-semibold">
            {book} {chapter}장
          </h2>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onNext}
            disabled={isPending}
            aria-label="다음 장"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
        {action}
      </header>
      <div className="space-y-2 text-base leading-relaxed">
        {verses.map((v) => (
          <p key={v.verse}>
            <span className="mr-1 text-xs text-muted-foreground">{v.verse}</span>
            {v.text}
          </p>
        ))}
      </div>
    </section>
  )
}
