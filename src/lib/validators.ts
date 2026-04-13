import { BIBLE_BOOKS } from '@/lib/bible/books'

export type ValidationResult = { valid: true } | { valid: false; error: string }

export const MAX_CONTENT_LENGTH = 10_000

export function validateMeditationInput(
  book: string,
  chapter: number,
  content: string
): ValidationResult {
  const bookDef = BIBLE_BOOKS.find((b) => b.name === book)
  if (!bookDef) {
    return { valid: false, error: `존재하지 않는 책입니다: ${book}` }
  }

  if (!Number.isInteger(chapter) || chapter < 1 || chapter > bookDef.chapters) {
    return {
      valid: false,
      error: `잘못된 장 번호입니다: ${book} ${chapter}`,
    }
  }

  if (content.trim().length === 0) {
    return { valid: false, error: '묵상 내용을 입력해주세요.' }
  }

  if (content.length > MAX_CONTENT_LENGTH) {
    return {
      valid: false,
      error: `묵상 내용은 ${MAX_CONTENT_LENGTH}자를 초과할 수 없습니다.`,
    }
  }

  return { valid: true }
}
