# Phase 8: Passage Selector

## 사전 준비

먼저 아래 문서들을 반드시 읽고 프로젝트의 전체 아키텍처와 설계 의도를 완전히 이해하라:

- `/docs/flow.md` (Flow 4: Passage Selection, Flow 5: Passage Change)
- `/docs/adr.md` (ADR-010)
- `/tasks/0-mvp/docs-diff.md`

그리고 이전 phase의 작업물을 반드시 확인하라:

- `src/app/(main)/page.tsx` (홈 페이지 — 본문 헤더의 [변경] 버튼 위치)
- `src/components/MeditationEditor.tsx` (선택된 챕터가 변경되면 draft도 갱신해야 함)
- `src/hooks/useDraft.ts`
- `src/lib/bible/books.ts` (BIBLE_BOOKS, OLD_TESTAMENT, NEW_TESTAMENT)
- `src/actions/bible.ts` (getChapter)

## 작업 내용

성경 책/장 선택 바텀시트를 구현한다.

### 1. shadcn/ui 컴포넌트 설치

```bash
npx shadcn@latest add sheet
npx shadcn@latest add tabs
```

`Sheet` 컴포넌트를 바텀시트로 활용한다 (side="bottom").

### 2. `src/components/PassageSelector.tsx`

Client Component (`'use client'`):

Props:
```ts
{
  currentBook: string
  currentChapter: number
  onSelect: (book: string, chapter: number) => void
}
```

UI 구조:
```
[변경] 버튼 클릭 → Sheet(side="bottom") 열림
├── [구약] / [신약] Tabs
│   └── 책 목록 (스크롤 가능)
│       └── 책 클릭 → 장 선택 화면으로 전환
│           ├── ← 뒤로가기 버튼 + "창세기" 헤더
│           └── 장 번호 그리드 (2~4열)
│               └── 장 클릭 → onSelect 호출 → Sheet 닫힘
```

동작:
1. 바텀시트가 열리면 구약/신약 탭 + 책 목록 표시.
2. 책을 탭하면 해당 책의 장 목록(그리드)으로 전환 (같은 시트 안에서 state 전환).
3. 장을 탭하면 즉시 `onSelect(book, chapter)` 호출 + 바텀시트 닫힘.
4. 확인 버튼 없음. 선택 즉시 적용.

현재 선택된 책/장은 시각적으로 강조 (배경색 또는 체크 표시).

### 3. 홈 화면 통합

`src/app/(main)/page.tsx`를 수정하여 PassageSelector를 통합한다.

본문 헤더 영역:
```
창세기 3장  [변경]
```

[변경] 버튼 클릭 → PassageSelector 열림.

챕터 변경 시 동작:
1. `onSelect`가 호출되면 홈 화면의 state를 업데이트.
2. 새 챕터의 성경 본문을 fetch (`getChapter` Server Action).
3. MeditationEditor의 book/chapter props도 업데이트.
4. 기존 묵상 내용은 유지 (Flow 5).
5. Draft의 book/chapter도 갱신.

이를 위해 홈 페이지에 클라이언트 상태 관리가 필요하다. Server Component인 page.tsx에서 초기 데이터를 fetch하고, 실제 인터랙션은 Client Component wrapper에서 처리하는 구조로 변경하라.

예시 구조:
```tsx
// page.tsx (Server Component)
export default async function HomePage() {
  const initialData = await fetchInitialData()
  return <HomeClient initialData={initialData} />
}

// components/HomeClient.tsx (Client Component)
'use client'
export function HomeClient({ initialData }) {
  const [currentBook, setCurrentBook] = useState(initialData.book)
  const [currentChapter, setCurrentChapter] = useState(initialData.chapter)
  const [verses, setVerses] = useState(initialData.verses)
  // ...
}
```

## Acceptance Criteria

```bash
npm run build
```

빌드 성공.

## AC 검증 방법

위 AC 커맨드를 실행하라. 모두 통과하면 `/tasks/0-mvp/index.json`의 phase 8 status를 `"completed"`로 변경하라.
수정 3회 이상 시도해도 실패하면 status를 `"error"`로 변경하고, 에러 내용을 index.json의 해당 phase에 `"error_message"` 필드로 기록하라.

## 주의사항

- Sheet(side="bottom")을 사용하라. 별도 바텀시트 라이브러리를 설치하지 마라. shadcn/ui의 Sheet 컴포넌트로 충분하다.
- 장 그리드에서 장 수가 많은 책 (시편: 150장)도 자연스럽게 스크롤되어야 한다.
- `onSelect` 후 바텀시트가 닫힐 때 상태가 올바르게 리셋되어야 한다 (다시 열면 책 목록부터 시작).
- 홈 페이지를 Server → Client 구조로 리팩토링할 때, 기존 Phase 6, 7에서 만든 컴포넌트(BiblePassage, MeditationEditor)와의 연결이 깨지지 않도록 주의하라.
- `npm run build` 전에 `npm test`를 실행하여 기존 테스트가 깨지지 않았는지 확인하라.
