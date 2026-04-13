# Phase 9: Records Tab

## 사전 준비

먼저 아래 문서들을 반드시 읽고 프로젝트의 전체 아키텍처와 설계 의도를 완전히 이해하라:

- `/docs/flow.md` (Flow 7: Records Tab)
- `/docs/prd.md` (Meditation 섹션 — 수정 기능, 생성일/수정일)
- `/docs/adr.md` (ADR-014)
- `/tasks/0-mvp/docs-diff.md`

그리고 이전 phase의 작업물을 반드시 확인하라:

- `src/actions/meditation.ts` (getMeditationRecords)
- `src/lib/db/schema.ts` (meditations 테이블)
- `src/app/(main)/layout.tsx` (탭바 — 기록 탭 링크)
- `src/lib/auth.ts`
- `src/lib/validators.ts`

## 작업 내용

기록 탭 페이지와 RecordList 컴포넌트를 구현한다.

### 1. `src/actions/meditation.ts`에 updateMeditation 추가

```ts
export async function updateMeditation(id: string, content: string): Promise<{ success: boolean; error?: string }>
```

동작:
1. 세션 검증.
2. content 검증: 빈 문자열 불가, 10,000자 제한.
3. **소유권 검증**: `WHERE id = ? AND user_id = session.user.id`. 반드시 두 조건을 AND로 사용.
4. `updatedAt`을 현재 시각으로 갱신.
5. `revalidatePath('/records')`.

### 2. `src/app/(main)/records/page.tsx`

Server Component:

```tsx
export default async function RecordsPage() {
  const records = await getMeditationRecords()
  return <RecordList records={records} />
}
```

### 3. `src/components/RecordList.tsx`

Client Component (`'use client'`):

Props:
```ts
{
  records: Meditation[]  // from actions/meditation.ts
}
```

**빈 상태**:
- records가 비어있으면: "아직 묵상 기록이 없어요.\n홈에서 첫 묵상을 작성해보세요." 표시.

**목록**:
- 각 항목: 날짜 | 책+장 | 묵상 첫 줄 미리보기 (1줄, 넘치면 ellipsis).
- 날짜 형식: "2026.04.13" 형태.

**인라인 펼치기**:
- 항목 클릭 → 해당 항목만 펼쳐서 전체 묵상 내용 표시.
- 다른 항목 클릭 시 기존 펼친 항목은 접히고 새 항목이 펼쳐짐 (accordion 방식).
- 펼친 상태에서 표시:
  - 전체 묵상 내용.
  - 생성일: "작성 2026.04.13 08:30" 형태.
  - 수정일: 수정한 경우에만 "수정 2026.04.13 21:00" 형태로 추가 표시.
  - [수정] 버튼.

**수정 모드**:
- [수정] 클릭 → textarea로 전환 (기존 내용 pre-fill).
- [저장] / [취소] 버튼 표시.
- [저장] → `updateMeditation(id, content)` Server Action 호출 → 성공 시 읽기 모드로 전환 + toast.
- [취소] → 변경 사항 버리고 읽기 모드로 전환.
- 저장 중: 버튼 비활성화 + 스피너.

### 4. 날짜/시간 포맷 유틸

```ts
// "2026.04.13" 형식
export function formatDate(date: Date | string): string

// "2026.04.13 08:30" 형식
export function formatDateTime(date: Date | string): string
```

KST 기준으로 포맷한다.

## Acceptance Criteria

```bash
npm run build && npm test
```

빌드 성공 + 모든 테스트 통과 (기존 테스트 포함).

## AC 검증 방법

위 AC 커맨드를 실행하라. 모두 통과하면 `/tasks/0-mvp/index.json`의 phase 9 status를 `"completed"`로 변경하라.
수정 3회 이상 시도해도 실패하면 status를 `"error"`로 변경하고, 에러 내용을 index.json의 해당 phase에 `"error_message"` 필드로 기록하라.

## 주의사항

- `updateMeditation`에서 소유권 검증을 절대 빠뜨리지 마라. `WHERE id = ?`만으로는 IDOR 취약점이 된다.
- createdAt과 updatedAt이 동일한 경우 (한 번도 수정하지 않은 경우) 수정일을 표시하지 마라.
- 인라인 펼치기는 accordion 패턴이지만, shadcn/ui Accordion 컴포넌트를 사용하든 직접 state로 구현하든 자유다. 핵심은 한 번에 하나만 펼쳐지는 것.
- RecordList에서 `useTransition`을 사용하여 수정 저장 시 non-blocking으로 처리하라.
- 묵상 내용에 줄바꿈이 있을 수 있다. `whitespace-pre-wrap`으로 렌더링하라.
