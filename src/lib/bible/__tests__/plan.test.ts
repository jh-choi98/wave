import { describe, it, expect } from 'vitest'
import { getChapterByDayOffset, getChapterIndex, getNextChapter } from '../plan'

describe('getNextChapter', () => {
  it('returns next chapter within a book', () => {
    expect(getNextChapter('창세기', 1)).toEqual({ book: '창세기', chapter: 2 })
  })

  it('crosses book boundary within old testament', () => {
    expect(getNextChapter('창세기', 50)).toEqual({ book: '출애굽기', chapter: 1 })
  })

  it('crosses old/new testament boundary', () => {
    expect(getNextChapter('말라기', 4)).toEqual({ book: '마태복음', chapter: 1 })
  })

  it('wraps from Revelation 22 back to Genesis 1', () => {
    expect(getNextChapter('요한계시록', 22)).toEqual({ book: '창세기', chapter: 1 })
  })
})

describe('getChapterByDayOffset', () => {
  it('day 0 is Genesis 1', () => {
    expect(getChapterByDayOffset(0)).toEqual({ book: '창세기', chapter: 1 })
  })

  it('day 49 is Genesis 50', () => {
    expect(getChapterByDayOffset(49)).toEqual({ book: '창세기', chapter: 50 })
  })

  it('day 50 is Exodus 1', () => {
    expect(getChapterByDayOffset(50)).toEqual({ book: '출애굽기', chapter: 1 })
  })

  it('day 1189 wraps to Genesis 1', () => {
    expect(getChapterByDayOffset(1189)).toEqual({ book: '창세기', chapter: 1 })
  })

  it('day 2378 wraps to Genesis 1', () => {
    expect(getChapterByDayOffset(2378)).toEqual({ book: '창세기', chapter: 1 })
  })
})

describe('getChapterIndex', () => {
  it('returns 0 for Genesis 1', () => {
    expect(getChapterIndex('창세기', 1)).toBe(0)
  })

  it('returns 49 for Genesis 50', () => {
    expect(getChapterIndex('창세기', 50)).toBe(49)
  })

  it('returns 50 for Exodus 1', () => {
    expect(getChapterIndex('출애굽기', 1)).toBe(50)
  })

  it('returns 1188 for Revelation 22', () => {
    expect(getChapterIndex('요한계시록', 22)).toBe(1188)
  })

  it('returns -1 for unknown book', () => {
    expect(getChapterIndex('존재안함', 1)).toBe(-1)
  })

  it('returns -1 for out-of-range chapter', () => {
    expect(getChapterIndex('창세기', 51)).toBe(-1)
    expect(getChapterIndex('창세기', 0)).toBe(-1)
  })
})
