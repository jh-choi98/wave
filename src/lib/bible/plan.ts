import { BIBLE_BOOKS, TOTAL_CHAPTERS } from './books'

export function getChapterIndex(book: string, chapter: number): number {
  let index = 0
  for (const b of BIBLE_BOOKS) {
    if (b.name === book) {
      if (chapter < 1 || chapter > b.chapters) return -1
      return index + (chapter - 1)
    }
    index += b.chapters
  }
  return -1
}

function getChapterByIndex(index: number): { book: string; chapter: number } {
  const normalized = ((index % TOTAL_CHAPTERS) + TOTAL_CHAPTERS) % TOTAL_CHAPTERS
  let remaining = normalized
  for (const b of BIBLE_BOOKS) {
    if (remaining < b.chapters) {
      return { book: b.name, chapter: remaining + 1 }
    }
    remaining -= b.chapters
  }
  // Unreachable given modulo above
  return { book: BIBLE_BOOKS[0].name, chapter: 1 }
}

export function getNextChapter(
  lastBook: string,
  lastChapter: number
): { book: string; chapter: number } {
  const idx = getChapterIndex(lastBook, lastChapter)
  if (idx === -1) {
    throw new Error(`Invalid book/chapter: ${lastBook} ${lastChapter}`)
  }
  return getChapterByIndex(idx + 1)
}

export function getChapterByDayOffset(dayOffset: number): { book: string; chapter: number } {
  return getChapterByIndex(dayOffset)
}
