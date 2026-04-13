import 'server-only'

export type Verse = {
  verse: number
  text: string
}

export interface BibleClient {
  getChapter(book: string, chapter: number): Promise<Verse[]>
}

const GENESIS_1_SAMPLE: Verse[] = [
  { verse: 1, text: '태초에 하나님이 천지를 창조하시니라' },
  {
    verse: 2,
    text: '땅이 혼돈하고 공허하며 흑암이 깊음 위에 있고 하나님의 영은 수면 위에 운행하시니라',
  },
  { verse: 3, text: '하나님이 이르시되 빛이 있으라 하시니 빛이 있었고' },
  {
    verse: 4,
    text: '빛이 하나님이 보시기에 좋았더라 하나님이 빛과 어둠을 나누사',
  },
  {
    verse: 5,
    text: '하나님이 빛을 낮이라 부르시고 어둠을 밤이라 부르시니라 저녁이 되고 아침이 되니 이는 첫째 날이니라',
  },
]

export class MockBibleClient implements BibleClient {
  async getChapter(book: string, chapter: number): Promise<Verse[]> {
    if (book === '창세기' && chapter === 1) {
      return GENESIS_1_SAMPLE
    }
    return Array.from({ length: 10 }, (_, i) => ({
      verse: i + 1,
      text: `(${book} ${chapter}장 ${i + 1}절)`,
    }))
  }
}

export function createBibleClient(): BibleClient {
  // MVP에서는 항상 MockBibleClient 반환
  // 추후 ApiBibleClient로 교체 (ADR-015)
  return new MockBibleClient()
}
