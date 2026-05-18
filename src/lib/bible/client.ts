import 'server-only'

import { readFileSync } from 'fs'
import { join } from 'path'
import { BIBLE_BOOKS } from './books'

export type Verse = {
  verse: number
  text: string
}

export interface BibleClient {
  getChapter(book: string, chapter: number): Promise<Verse[]>
}

type BollsVerse = { pk: number; verse: number; text: string; comment?: string }
type BibleJson = Record<string, Record<string, BollsVerse[]>>

let _cache: BibleJson | null = null

function loadBibleData(): BibleJson {
  if (!_cache) {
    const filePath = join(process.cwd(), 'src/data/bible-krv.json')
    _cache = JSON.parse(readFileSync(filePath, 'utf-8'))
  }
  return _cache!
}

export class StaticBibleClient implements BibleClient {
  async getChapter(book: string, chapter: number): Promise<Verse[]> {
    const bookIndex = BIBLE_BOOKS.findIndex((b) => b.name === book)
    if (bookIndex === -1) {
      throw new Error(`Unknown book: ${book}`)
    }
    const bookId = String(bookIndex + 1)
    const chapterId = String(chapter)
    const bible = loadBibleData()
    const verses = bible[bookId]?.[chapterId]
    if (!verses) {
      throw new Error(`Chapter not found: ${book} ${chapter}`)
    }
    return verses.map((v) => ({ verse: v.verse, text: v.text }))
  }
}

export function createBibleClient(): BibleClient {
  return new StaticBibleClient()
}
