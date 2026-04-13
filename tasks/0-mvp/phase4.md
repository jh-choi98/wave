# Phase 4: Bible Data Layer

## 사전 준비

먼저 아래 문서들을 반드시 읽고 프로젝트의 전체 아키텍처와 설계 의도를 완전히 이해하라:

- `/docs/prd.md` (Bible Passage 섹션)
- `/docs/code-architecture.md` (Bible Data Flow 섹션)
- `/docs/adr.md` (ADR-006, ADR-007, ADR-015)
- `/docs/data-schema.md` (bible_cache, Chapter Calculation Logic)
- `/docs/testing.md`
- `/tasks/0-mvp/docs-diff.md`

그리고 이전 phase의 작업물을 반드시 확인하라:

- `src/lib/db/schema.ts` (bible_cache 테이블)
- `src/lib/db/index.ts` (DB 클라이언트)
- `vitest.config.ts` (테스트 설정)
- `package.json`

## 작업 내용

성경 데이터 레이어를 구현한다. 66권 상수, 통독표 로직, mock 성경 클라이언트, Server Action.

### 1. `src/lib/bible/books.ts`

66권 성경 데이터 상수:

```ts
export type BibleBook = {
  name: string       // 한글 이름 (예: '창세기')
  chapters: number   // 장 수 (예: 50)
  testament: 'old' | 'new'
}

export const BIBLE_BOOKS: BibleBook[] = [
  // 구약 39권
  { name: '창세기', chapters: 50, testament: 'old' },
  { name: '출애굽기', chapters: 40, testament: 'old' },
  // ... 나머지 전부 (공식 개역개정 순서를 따른다)
  // 신약 27권
  { name: '마태복음', chapters: 28, testament: 'new' },
  // ... 나머지 전부
  { name: '요한계시록', chapters: 22, testament: 'new' },
]

export const TOTAL_CHAPTERS = 1_189  // 검증용 상수

export const OLD_TESTAMENT = BIBLE_BOOKS.filter(b => b.testament === 'old')
export const NEW_TESTAMENT = BIBLE_BOOKS.filter(b => b.testament === 'new')
```

핵심 규칙:
- 반드시 66권 전부를 정확한 순서와 장 수로 포함해야 한다.
- 장 수 합계가 정확히 1,189여야 한다.

### 2. `src/lib/bible/plan.ts`

통독표 로직:

```ts
export function getNextChapter(lastBook: string, lastChapter: number): { book: string; chapter: number }
export function getChapterByDayOffset(dayOffset: number): { book: string; chapter: number }
export function getChapterIndex(book: string, chapter: number): number
```

`getNextChapter`:
- 현재 책의 다음 장을 반환.
- 마지막 장이면 다음 책의 1장 반환.
- 요한계시록 22장이면 창세기 1장으로 순환.

`getChapterByDayOffset`:
- 가입일로부터 경과 일수(0-based)를 받아 해당 챕터를 반환.
- dayOffset 0 = 창세기 1장.
- dayOffset ≥ 1189 → 나머지 연산으로 순환.

`getChapterIndex`:
- book + chapter를 전체 1,189장 순서에서의 인덱스(0-based)로 변환.
- plan.ts의 다른 함수들에서 내부적으로 활용.

### 3. `src/lib/bible/client.ts`

성경 본문 조회 인터페이스 + Mock 구현:

```ts
import 'server-only'

export type Verse = {
  verse: number
  text: string
}

export interface BibleClient {
  getChapter(book: string, chapter: number): Promise<Verse[]>
}
```

`MockBibleClient`:
- 모든 요청에 대해 해당 책+장의 샘플 절을 반환.
- 최소 5절 이상의 의미 있는 샘플 데이터 포함 (창세기 1장 1-5절 실제 텍스트 권장).
- 나머지 책은 "({book} {chapter}장 {verse}절)" 형태의 placeholder 텍스트를 10절 생성.

```ts
export function createBibleClient(): BibleClient {
  // MVP에서는 항상 MockBibleClient 반환
  // 추후 ApiBibleClient로 교체 (ADR-015)
  return new MockBibleClient()
}
```

### 4. `src/actions/bible.ts`

Server Action:

```ts
'use server'

export async function getChapter(book: string, chapter: number): Promise<Verse[]>
```

로직:
1. 입력 검증: `book`이 `BIBLE_BOOKS`에 존재하는지, `chapter`가 1 이상 해당 책 최대 장 수 이하인지.
2. DB `bible_cache` 조회 (cache-first).
3. cache miss → `createBibleClient().getChapter()` 호출 → 결과를 `bible_cache`에 저장.
4. 결과 반환.

입력이 유효하지 않으면 에러를 throw한다.

### 5. 테스트

`src/lib/bible/__tests__/books.test.ts`:

| 테스트 케이스 | 검증 |
|---|---|
| 전체 권 수 | BIBLE_BOOKS.length === 66 |
| 전체 장 수 합계 | sum of chapters === 1,189 |
| 구약 권 수 | OLD_TESTAMENT.length === 39 |
| 신약 권 수 | NEW_TESTAMENT.length === 27 |
| 첫 번째 권 | name === '창세기', chapters === 50 |
| 마지막 권 | name === '요한계시록', chapters === 22 |
| 각 권 장 수 | 모두 > 0 |

`src/lib/bible/__tests__/plan.test.ts`:

| 테스트 케이스 | 입력 | 기대 출력 |
|---|---|---|
| 일반 다음 챕터 | 창세기 1장 | 창세기 2장 |
| 권 경계 | 창세기 50장 | 출애굽기 1장 |
| 신구약 경계 | 말라기 4장 | 마태복음 1장 |
| 순환 | 요한계시록 22장 | 창세기 1장 |
| Day 0 | offset 0 | 창세기 1장 |
| Day 49 | offset 49 | 창세기 50장 |
| Day 50 | offset 50 | 출애굽기 1장 |
| 순환 | offset 1189 | 창세기 1장 |
| 큰 offset | offset 2378 | 창세기 1장 |
| 잘못된 book | getChapterIndex('존재안함', 1) | -1 또는 에러 |

## Acceptance Criteria

```bash
npm run build && npm test
```

빌드 성공 + 모든 테스트 통과.

## AC 검증 방법

위 AC 커맨드를 실행하라. 모두 통과하면 `/tasks/0-mvp/index.json`의 phase 4 status를 `"completed"`로 변경하라.
수정 3회 이상 시도해도 실패하면 status를 `"error"`로 변경하고, 에러 내용을 index.json의 해당 phase에 `"error_message"` 필드로 기록하라.

## 주의사항

- 66권의 순서와 장 수를 절대 틀리지 마라. 공식 개역개정 순서를 따른다.
- `client.ts`에 `import 'server-only'`를 반드시 포함하라. 실수로 클라이언트 번들에 포함되면 안 된다.
- `actions/bible.ts`의 `getChapter`에서 DB 조회가 실패해도 (DB 연결 없음 등) 에러가 발생할 수 있다. 빌드는 성공해야 하지만 런타임 DB 연결은 이 phase에서 테스트하지 않는다.
- scripture.api.bible 관련 코드를 작성하지 마라. MockBibleClient만 구현한다.
- 테스트 파일에서 DB나 Server Action을 호출하지 마라. 순수 로직(books.ts, plan.ts)만 테스트한다.
