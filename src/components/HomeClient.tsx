'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { getChapter } from '@/actions/bible'
import { BiblePassage } from '@/components/BiblePassage'
import { MeditationEditor } from '@/components/MeditationEditor'
import { PassageSelector } from '@/components/PassageSelector'
import { getNextChapter, getPrevChapter } from '@/lib/bible/plan'
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
        isPending={isPending}
        onPrev={() => {
          const prev = getPrevChapter(book, chapter)
          handleSelect(prev.book, prev.chapter)
        }}
        onNext={() => {
          const next = getNextChapter(book, chapter)
          handleSelect(next.book, next.chapter)
        }}
        action={
          <PassageSelector
            currentBook={book}
            currentChapter={chapter}
            onSelect={handleSelect}
          />
        }
      />
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
