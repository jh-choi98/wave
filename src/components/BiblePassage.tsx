import type { ReactNode } from 'react'
import type { Verse } from '@/lib/bible/client'

export type BiblePassageProps = {
  book: string
  chapter: number
  verses: Verse[]
  action?: ReactNode
}

export function BiblePassage({ book, chapter, verses, action }: BiblePassageProps) {
  return (
    <section className="flex-1 overflow-y-auto px-4 py-3">
      <header className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold">
          {book} {chapter}장
        </h2>
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
