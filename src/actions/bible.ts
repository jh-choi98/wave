'use server'

import { and, eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { bibleCache } from '@/lib/db/schema'
import { BIBLE_BOOKS } from '@/lib/bible/books'
import { createBibleClient, type Verse } from '@/lib/bible/client'

export async function getChapter(book: string, chapter: number): Promise<Verse[]> {
  const bookDef = BIBLE_BOOKS.find((b) => b.name === book)
  if (!bookDef) {
    throw new Error(`Unknown book: ${book}`)
  }
  if (!Number.isInteger(chapter) || chapter < 1 || chapter > bookDef.chapters) {
    throw new Error(`Invalid chapter ${chapter} for ${book}`)
  }

  const cached = await db
    .select()
    .from(bibleCache)
    .where(and(eq(bibleCache.book, book), eq(bibleCache.chapter, chapter)))
    .limit(1)

  if (cached.length > 0) {
    return cached[0].verses as Verse[]
  }

  const verses = await createBibleClient().getChapter(book, chapter)

  await db
    .insert(bibleCache)
    .values({ book, chapter, verses })
    .onConflictDoNothing()

  return verses
}
