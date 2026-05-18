import { describe, it, expect } from 'vitest'
import {
  BIBLE_BOOKS,
  NEW_TESTAMENT,
  OLD_TESTAMENT,
  TOTAL_CHAPTERS,
} from '../books'

describe('BIBLE_BOOKS', () => {
  it('has 66 books', () => {
    expect(BIBLE_BOOKS.length).toBe(66)
  })

  it('total chapters equals 1189', () => {
    const sum = BIBLE_BOOKS.reduce((acc, b) => acc + b.chapters, 0)
    expect(sum).toBe(1189)
    expect(sum).toBe(TOTAL_CHAPTERS)
  })

  it('has 39 old testament books', () => {
    expect(OLD_TESTAMENT.length).toBe(39)
  })

  it('has 27 new testament books', () => {
    expect(NEW_TESTAMENT.length).toBe(27)
  })

  it('first book is 창세기 with 50 chapters', () => {
    expect(BIBLE_BOOKS[0].name).toBe('창세기')
    expect(BIBLE_BOOKS[0].chapters).toBe(50)
  })

  it('last book is 요한계시록 with 22 chapters', () => {
    const last = BIBLE_BOOKS[BIBLE_BOOKS.length - 1]
    expect(last.name).toBe('요한계시록')
    expect(last.chapters).toBe(22)
  })

  it('every book has positive chapter count', () => {
    for (const b of BIBLE_BOOKS) {
      expect(b.chapters).toBeGreaterThan(0)
    }
  })
})
