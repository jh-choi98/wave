# Phase 6: Main Layout + Home Page Shell

## 사전 준비

먼저 아래 문서들을 반드시 읽고 프로젝트의 전체 아키텍처와 설계 의도를 완전히 이해하라:

- `/docs/flow.md` (Flow 2, 3)
- `/docs/code-architecture.md` (Rendering Strategy, Project Structure)
- `/docs/adr.md` (ADR-013, ADR-014)
- `/tasks/0-mvp/docs-diff.md`

그리고 이전 phase의 작업물을 반드시 확인하라:

- `src/lib/auth.ts` (auth() 함수)
- `src/actions/meditation.ts` (getTodayMeditation, getLastMeditation)
- `src/actions/bible.ts` (getChapter)
- `src/lib/bible/plan.ts` (getNextChapter, getChapterByDayOffset)
- `src/lib/db/schema.ts` (users 테이블 — createdAt)
- `src/app/layout.tsx` (root layout)

## 작업 내용

메인 레이아웃(탭바 포함)과 홈 페이지 Server Component를 구현한다.

### 1. `src/app/(main)/layout.tsx`

인증된 유저 전용 레이아웃:

- 하단 고정 탭바: 홈 / 기록 2개 탭.
- 현재 활성 탭 시각적 구분 (색상 또는 아이콘 강조).
- 탭바는 고정 위치 (`fixed bottom`).
- 탭바 위 영역은 `children`을 렌더링.
- 탭바 높이만큼 body에 padding-bottom 적용하여 컨텐츠가 가려지지 않도록.

아이콘은 lucide-react 사용 (shadcn/ui와 함께 설치됨):
- 홈: `Home` 아이콘
- 기록: `BookOpen` 또는 `List` 아이콘

탭은 Next.js `Link` 컴포넌트로 구현. `usePathname()`으로 현재 경로 감지하여 활성 탭 표시. 이 레이아웃은 Client Component (`'use client'`).

### 2. `src/app/(main)/page.tsx`

홈 페이지 Server Component. 데이터 fetch + 하위 Client Component에 props 전달.

로직:
1. `auth()`로 세션 확인. 세션에서 `user.id` 추출.
2. `getTodayMeditation()` 호출 — 오늘 묵상이 있는지 확인.
3. 오늘의 챕터 결정:
   - 오늘 묵상 있음 → 해당 book, chapter 사용.
   - 없음 → `getLastMeditation()` 호출.
     - 있음 → `getNextChapter(lastBook, lastChapter)`.
     - 없음 (신규 유저) → DB에서 user.createdAt 조회 → 경과 일수 계산 → `getChapterByDayOffset(offset)`.
4. `getChapter(book, chapter)` 호출 — 성경 본문 가져오기.
5. 데이터를 Client Component들에 props로 전달.

렌더링 구조:
```tsx
<div className="flex flex-col h-[100dvh]">
  {/* Header: 날짜 + 완료 뱃지 + 프로필 */}
  <Header />

  {/* 본문 영역 (스크롤 가능) */}
  <BiblePassage />

  {/* 묵상 입력 영역 (하단 고정) */}
  <MeditationEditor />
</div>
```

이 phase에서는 BiblePassage와 MeditationEditor를 placeholder로 구현한다 (props 인터페이스만 정의하고 간단한 내용 표시). 실제 구현은 Phase 7.

### 3. 날짜 표시 유틸

```ts
function formatKSTDate(date: Date): string
// "2026년 4월 13일" 형식
```

### 4. shadcn/ui 컴포넌트 설치

이 phase에서 필요한 것만:

```bash
npx shadcn@latest add avatar
npx shadcn@latest add dropdown-menu
```

### 5. 기존 `src/app/page.tsx` 제거

Phase 1에서 만든 임시 홈페이지를 제거한다. 이제 `(main)/page.tsx`가 `/` 경로를 담당한다.

## Acceptance Criteria

```bash
npm run build
```

빌드 성공.

## AC 검증 방법

위 AC 커맨드를 실행하라. 모두 통과하면 `/tasks/0-mvp/index.json`의 phase 6 status를 `"completed"`로 변경하라.
수정 3회 이상 시도해도 실패하면 status를 `"error"`로 변경하고, 에러 내용을 index.json의 해당 phase에 `"error_message"` 필드로 기록하라.

## 주의사항

- `(main)/layout.tsx`는 `'use client'`여야 한다 (`usePathname` 사용). 하지만 `(main)/page.tsx`는 Server Component다. 이 구분을 명확히 하라.
- `100dvh`를 사용하라 (`100vh` 아닌). 모바일 브라우저 주소창 높이 대응 (ADR-013).
- 탭바가 컨텐츠를 가리지 않도록 padding을 적용하라.
- BiblePassage, MeditationEditor의 실제 구현은 Phase 7에서 한다. 이 phase에서는 props 인터페이스만 정확히 정의하고 placeholder를 렌더링하라.
- Phase 1에서 만든 `src/app/page.tsx`(임시 홈)를 삭제하라. 라우트 충돌이 발생한다.
- `npm run build` 전에 `npm test`를 실행하여 기존 테스트가 깨지지 않았는지 확인하라.
