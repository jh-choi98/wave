# Phase 5: Server Actions — Meditation

## 사전 준비

먼저 아래 문서들을 반드시 읽고 프로젝트의 전체 아키텍처와 설계 의도를 완전히 이해하라:

- `/docs/prd.md` (Meditation 섹션)
- `/docs/code-architecture.md` (Server Action Security 섹션)
- `/docs/data-schema.md` (meditations 테이블, Key Queries)
- `/docs/testing.md`
- `/tasks/0-mvp/docs-diff.md`

그리고 이전 phase의 작업물을 반드시 확인하라:

- `src/lib/db/schema.ts` (meditations 테이블)
- `src/lib/db/index.ts`
- `src/lib/auth.ts` (auth() 함수)
- `src/lib/bible/books.ts` (BIBLE_BOOKS — 유효성 검증에 사용)

## 작업 내용

묵상 CRUD Server Actions를 구현한다.

### 1. `src/lib/validators.ts`

입력 검증 순수 함수 (테스트 가능하도록 분리):

```ts
export function validateMeditationInput(book: string, chapter: number, content: string): { valid: true } | { valid: false; error: string }
```

검증 규칙:
- `book`이 `BIBLE_BOOKS`에 존재해야 한다.
- `chapter`가 1 이상, 해당 책의 최대 장 수 이하여야 한다.
- `content`가 빈 문자열이거나 공백만으로 이루어지면 안 된다.
- `content` 길이가 10,000자를 초과하면 안 된다.

### 2. `src/actions/meditation.ts`

4개 Server Action:

```ts
'use server'

export async function saveMeditation(book: string, chapter: number, content: string): Promise<{ success: boolean; error?: string }>
export async function getTodayMeditation(): Promise<Meditation | null>
export async function getLastMeditation(): Promise<{ book: string; chapter: number } | null>
export async function getMeditationRecords(): Promise<Meditation[]>
```

모든 Server Action에 적용할 공통 보안 패턴:

```ts
const session = await auth()
if (!session?.user?.id) throw new Error('Unauthorized')
```

**`saveMeditation`**:
1. 세션 검증
2. `validateMeditationInput` 호출
3. KST 기준 오늘 날짜 계산 (`Asia/Seoul` timezone)
4. UPSERT: `onConflictDoUpdate` on `(userId, date)` — content, book, chapter, updatedAt 업데이트
5. `revalidatePath('/')` + `revalidatePath('/records')`
6. 성공/실패 반환

**`getTodayMeditation`**:
1. 세션 검증
2. KST 기준 오늘 날짜 계산
3. `SELECT * FROM meditations WHERE user_id = ? AND date = ?`

**`getLastMeditation`**:
1. 세션 검증
2. `SELECT book, chapter FROM meditations WHERE user_id = ? ORDER BY date DESC LIMIT 1`

**`getMeditationRecords`**:
1. 세션 검증
2. `SELECT * FROM meditations WHERE user_id = ? ORDER BY date DESC`

KST 날짜 계산 헬퍼:

```ts
function getKSTDate(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Seoul' })
  // 'en-CA' locale returns YYYY-MM-DD format
}
```

### 3. `src/actions/meditation.ts` — 소유권 검증 (update)

`saveMeditation`은 UPSERT라서 자동으로 `userId`가 세션 유저로 제한된다. 기록탭 수정 기능은 이후 Records phase에서 별도로 `updateMeditation(id, content)` 액션을 추가할 때 소유권 검증을 적용한다.

### 4. 테스트

`src/lib/__tests__/validators.test.ts`:

| 테스트 케이스 | 입력 | 기대 |
|---|---|---|
| 유효한 입력 | ('창세기', 1, '묵상 내용') | valid: true |
| 존재하지 않는 book | ('존재안함', 1, '내용') | valid: false |
| chapter 0 | ('창세기', 0, '내용') | valid: false |
| chapter 초과 | ('창세기', 51, '내용') | valid: false |
| 빈 content | ('창세기', 1, '') | valid: false |
| 공백만 content | ('창세기', 1, '   ') | valid: false |
| 10,001자 content | ('창세기', 1, 'a'.repeat(10001)) | valid: false |
| 정확히 10,000자 | ('창세기', 1, 'a'.repeat(10000)) | valid: true |

## Acceptance Criteria

```bash
npm run build && npm test
```

빌드 성공 + 모든 테스트 통과.

## AC 검증 방법

위 AC 커맨드를 실행하라. 모두 통과하면 `/tasks/0-mvp/index.json`의 phase 5 status를 `"completed"`로 변경하라.
수정 3회 이상 시도해도 실패하면 status를 `"error"`로 변경하고, 에러 내용을 index.json의 해당 phase에 `"error_message"` 필드로 기록하라.

## 주의사항

- `revalidatePath`를 빠뜨리면 저장 후 UI가 갱신되지 않는다. `saveMeditation`에서 반드시 호출.
- KST 날짜 계산에서 UTC 기준으로 하면 안 된다. 반드시 `Asia/Seoul` timezone 사용.
- Server Action에서 `throw new Error`보다 `{ success: false, error: '...' }` 패턴을 우선 사용하라. 클라이언트에서 에러 처리가 쉽다.
- 테스트는 `validators.ts`의 순수 함수만 테스트한다. Server Action 자체를 테스트하지 마라 (DB 의존).
