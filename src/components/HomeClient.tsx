'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { getChapter } from '@/actions/bible'
import { BiblePassage } from '@/components/BiblePassage'
import { MeditationEditor } from '@/components/MeditationEditor'
import { PassageSelector } from '@/components/PassageSelector'
import type { Verse } from '@/lib/bible/client'

export type HomeClientProps = {
  initialBook: string
  initialChapter: number
  initialVerses: Verse[]
  initialContent: string
  hasSavedToday: boolean
  userId: string
  dateKey: string
}

export function HomeClient({
  initialBook,
  initialChapter,
  initialVerses,
  initialContent,
  hasSavedToday,
  userId,
  dateKey,
}: HomeClientProps) {
  const [book, setBook] = useState(initialBook)
  const [chapter, setChapter] = useState(initialChapter)
  const [verses, setVerses] = useState<Verse[]>(initialVerses)
  const [isPending, startTransition] = useTransition()

  const handleSelect = (nextBook: string, nextChapter: number) => {
    if (nextBook === book && nextChapter === chapter) return
    startTransition(async () => {
      try {
        const nextVerses = await getChapter(nextBook, nextChapter)
        setBook(nextBook)
        setChapter(nextChapter)
        setVerses(nextVerses)
      } catch {
        toast.error('본문을 불러오지 못했습니다')
      }
    })
  }

  return (
    <>
      <BiblePassage
        book={book}
        chapter={chapter}
        verses={verses}
        action={
          <PassageSelector
            currentBook={book}
            currentChapter={chapter}
            onSelect={handleSelect}
          />
        }
      />
      {isPending && (
        <div className="px-4 pb-1 text-xs text-muted-foreground">본문 불러오는 중…</div>
      )}
      <MeditationEditor
        book={book}
        chapter={chapter}
        initialContent={initialContent}
        isCompleted={hasSavedToday}
        userId={userId}
        date={dateKey}
      />
    </>
  )
}
