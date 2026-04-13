import { describe, it, expect } from 'vitest'
import { validateMeditationInput } from '@/lib/validators'

describe('validateMeditationInput', () => {
  it('유효한 입력을 허용한다', () => {
    expect(validateMeditationInput('창세기', 1, '묵상 내용')).toEqual({ valid: true })
  })

  it('존재하지 않는 book을 거부한다', () => {
    const result = validateMeditationInput('존재안함', 1, '내용')
    expect(result.valid).toBe(false)
  })

  it('chapter 0을 거부한다', () => {
    const result = validateMeditationInput('창세기', 0, '내용')
    expect(result.valid).toBe(false)
  })

  it('책의 최대 장 수를 초과하는 chapter를 거부한다', () => {
    const result = validateMeditationInput('창세기', 51, '내용')
    expect(result.valid).toBe(false)
  })

  it('빈 content를 거부한다', () => {
    const result = validateMeditationInput('창세기', 1, '')
    expect(result.valid).toBe(false)
  })

  it('공백만 있는 content를 거부한다', () => {
    const result = validateMeditationInput('창세기', 1, '   ')
    expect(result.valid).toBe(false)
  })

  it('10,001자 content를 거부한다', () => {
    const result = validateMeditationInput('창세기', 1, 'a'.repeat(10001))
    expect(result.valid).toBe(false)
  })

  it('정확히 10,000자 content를 허용한다', () => {
    expect(validateMeditationInput('창세기', 1, 'a'.repeat(10000))).toEqual({ valid: true })
  })
})
