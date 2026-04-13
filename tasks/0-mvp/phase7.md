# Phase 7: Home Screen Components

## 사전 준비

먼저 아래 문서들을 반드시 읽고 프로젝트의 전체 아키텍처와 설계 의도를 완전히 이해하라:

- `/docs/flow.md` (Flow 2, 3, 5, 6)
- `/docs/prd.md` (Meditation, Draft 섹션)
- `/docs/adr.md` (ADR-009, ADR-012, ADR-013)
- `/tasks/0-mvp/docs-diff.md`

그리고 이전 phase의 작업물을 반드시 확인하라:

- `src/app/(main)/page.tsx` (홈 페이지 — props 인터페이스 확인)
- `src/actions/meditation.ts` (saveMeditation)
- `src/actions/bible.ts` (getChapter)
- `src/lib/bible/books.ts` (BIBLE_BOOKS)
- `src/components/ui/` (설치된 shadcn 컴포넌트 확인)

## 작업 내용

홈 화면의 실제 Client Component들을 구현한다.

### 1. `src/components/BiblePassage.tsx`

성경 본문 표시 컴포넌트:

Props:
```ts
{
  book: string
  chapter: number
  verses: Verse[]  // from lib/bible/client.ts
}
```

렌더링:
- 본문 헤더: "창세기 3장" 형태 (이 컴포넌트 내부가 아니라 부모에서 표시할 수도 있음 — 부모 page.tsx 구현 확인 후 결정).
- 각 절: "{절 번호} {본문 텍스트}" 형태로 표시.
- 절 번호는 본문 텍스트보다 시각적으로 작고 연하게 (text-muted-foreground).
- 독립 스크롤 영역 (`overflow-y-auto`, flex-1로 남은 공간 채움).

이 컴포넌트는 Server Component로 구현 가능 (상호작용 없음).

### 2. `src/components/MeditationEditor.tsx`

묵상 작성/수정 Client Component (`'use client'`):

Props:
```ts
{
  book: string
  chapter: number
  initialContent?: string  // 오늘 이미 작성한 묵상이 있으면 전달
  isCompleted: boolean     // 오늘 묵상 완료 여부
  userId: string           // draft key에 필요
}
```

기능:
- textarea: 묵상 내용 입력. placeholder "오늘의 묵상을 적어보세요".
- 완료 뱃지: `isCompleted`가 true면 상단에 "✓ 오늘 묵상 완료" 표시.
- 저장 버튼: `saveMeditation(book, chapter, content)` Server Action 호출.
- 저장 중 상태: 버튼 비활성화 + 로딩 스피너 표시. `useTransition` 사용.
- 저장 완료: toast "저장되었습니다" (아래 shadcn toast 설치 참조).
- Draft 연동: `useDraft` hook 사용 (아래 구현).

shadcn/ui 설치:
```bash
npx shadcn@latest add textarea
npx shadcn@latest add sonner
```

Sonner toast 사용: root layout에 `<Toaster />` 추가. `toast('저장되었습니다')` 호출.

### 3. `src/hooks/useDraft.ts`

localStorage draft 관리 Client hook:

```ts
type Draft = {
  book: string
  chapter: number
  content: string
}

export function useDraft(userId: string, date: string): {
  draft: Draft | null
  saveDraft: (draft: Draft) => void
  clearDraft: () => void
}
```

핵심 규칙:
- localStorage key: `draft_${userId}_${date}` (ADR-009).
- `saveDraft`: 타이핑할 때마다 호출 (debounce 300ms 권장).
- `clearDraft`: DB 저장 완료 시 호출.
- 날짜가 바뀌면 이전 draft는 자동으로 무시됨 (key에 date 포함).
- SSR 안전: `typeof window !== 'undefined'` 체크.

MeditationEditor에서의 사용:
1. 마운트 시 draft 복원 → textarea에 반영.
2. 단, `initialContent`가 있으면 (오늘 이미 저장됨) initialContent 우선.
3. 타이핑 시 `saveDraft({ book, chapter, content })`.
4. 저장 완료 시 `clearDraft()`.

### 4. 첫 방문 안내 배너

홈 화면에 조건부로 표시:
- `localStorage.getItem('wave_onboarded')` 체크.
- 없으면 배너 표시: "첫 번째 본문은 창세기 1장입니다"
- X 버튼 클릭 시 `localStorage.setItem('wave_onboarded', 'true')` → 배너 숨김.

### 5. 프로필 아이콘 + 로그아웃

홈 화면 헤더 우측:
- Google 프로필 이미지 (avatar).
- 클릭 시 드롭다운: "로그아웃" 항목 1개.
- 로그아웃 시 `signOut()` 호출.

### 6. `src/app/(main)/page.tsx` 업데이트

Phase 6에서 만든 placeholder를 실제 컴포넌트로 교체한다. 데이터 fetch 로직은 이미 Phase 6에서 구현됨.

## Acceptance Criteria

```bash
npm run build
```

빌드 성공.

## AC 검증 방법

위 AC 커맨드를 실행하라. 모두 통과하면 `/tasks/0-mvp/index.json`의 phase 7 status를 `"completed"`로 변경하라.
수정 3회 이상 시도해도 실패하면 status를 `"error"`로 변경하고, 에러 내용을 index.json의 해당 phase에 `"error_message"` 필드로 기록하라.

## 주의사항

- `useDraft`에서 `initialContent`가 있으면 draft보다 우선해야 한다. 그렇지 않으면 DB 저장된 내용이 localStorage draft로 덮어씌워진다.
- `<Toaster />`를 root `layout.tsx`에 추가할 때, 기존 레이아웃 구조를 깨뜨리지 마라.
- `useTransition`으로 Server Action을 호출하라. `startTransition` 안에서 호출해야 페이지 전환 없이 동작한다.
- BiblePassage는 Server Component로 유지할 수 있으면 유지하라. 불필요하게 Client Component로 만들지 마라.
- `npm run build` 전에 `npm test`를 실행하여 기존 테스트가 깨지지 않았는지 확인하라.
- 모바일 키보드 대응 CSS (`dvh`)는 Phase 10에서 처리한다. 이 phase에서는 기본 레이아웃만 구현.
