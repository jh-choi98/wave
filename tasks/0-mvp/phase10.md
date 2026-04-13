# Phase 10: Polish + Infra

## 사전 준비

먼저 아래 문서들을 반드시 읽고 프로젝트의 전체 아키텍처와 설계 의도를 완전히 이해하라:

- `/docs/flow.md` (Common States 테이블)
- `/docs/code-architecture.md` (Caching & Revalidation, next.config.ts, Mobile 섹션)
- `/docs/adr.md` (ADR-013)
- `/docs/prd.md` (Legal 섹션)
- `/tasks/0-mvp/docs-diff.md`

그리고 이전 phase의 작업물을 반드시 확인하라:

- `src/app/(main)/page.tsx`
- `src/app/(main)/records/page.tsx`
- `src/app/(main)/layout.tsx`
- `src/app/layout.tsx` (root layout)
- `src/middleware.ts`
- `next.config.ts`
- `package.json`

이전 phase에서 만든 모든 컴포넌트와 페이지를 읽고 전체 구조를 파악한 후 작업하라.

## 작업 내용

로딩/에러 상태, 법적 페이지, cron, 모바일 대응 등 마무리 작업.

### 1. Loading UI

`src/app/(main)/loading.tsx`:
- 홈 화면 스켈레톤: 헤더 영역 + 본문 영역 + 입력창 영역의 placeholder 블록들.
- Tailwind `animate-pulse` 사용.

`src/app/(main)/records/loading.tsx`:
- 기록 목록 스켈레톤: 3~5개의 리스트 아이템 placeholder.
- Tailwind `animate-pulse` 사용.

### 2. Error UI

`src/app/(main)/error.tsx`:
```tsx
'use client'

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div>
      <p>문제가 발생했습니다.</p>
      <button onClick={reset}>다시 시도</button>
    </div>
  )
}
```

`src/app/(main)/records/error.tsx`: 동일 패턴.

스타일은 간결하게. 포인트 색상 활용.

### 3. Legal 페이지

`src/app/privacy/page.tsx`:
```
개인정보처리방침

WAVE는 Google 로그인을 통해 이메일, 이름, 프로필 사진을 수집합니다.
수집된 정보는 서비스 제공 목적으로만 사용되며, 제3자에게 제공되지 않습니다.
사용자는 언제든지 계정 삭제를 요청할 수 있습니다.

문의: [이메일 placeholder]
```

`src/app/terms/page.tsx`:
```
이용약관

WAVE는 성경 묵상 기록 서비스입니다.
서비스 이용 시 아래 사항에 동의하는 것으로 간주합니다.

1. 사용자가 작성한 묵상 내용의 저작권은 사용자에게 있습니다.
2. 서비스 운영을 위해 묵상 내용을 서버에 저장합니다.
3. 서비스는 사전 고지 후 변경 또는 종료될 수 있습니다.
```

이 두 페이지는 비로그인으로 접근 가능해야 한다. middleware에서 이미 `/privacy`, `/terms`는 제외되어 있는지 확인하라.

### 4. Cron Ping

`src/app/api/cron/ping/route.ts`:
```ts
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { sql } from 'drizzle-orm'

export async function GET(request: Request) {
  const auth = request.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  await db.execute(sql`SELECT 1`)
  return NextResponse.json({ ok: true })
}
```

`vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/cron/ping",
      "schedule": "0 0 */6 * *"
    }
  ]
}
```

### 5. 모바일 키보드 대응

홈 화면 레이아웃에서 키보드가 올라올 때 본문 영역이 적절히 줄어들도록:

- `h-[100dvh]` 사용 (이미 적용되어 있을 수 있음 — 확인).
- textarea에 focus 시 스크롤하여 textarea가 보이도록.
- CSS 수준에서 최소한의 대응. 복잡한 JavaScript 로직은 피한다.

### 6. 최종 점검

- `next.config.ts`에 security headers와 remotePatterns가 정확히 설정되어 있는지 확인.
- middleware의 matcher가 모든 공개 경로를 올바르게 제외하는지 확인: `/login`, `/privacy`, `/terms`, `/api/auth`, `/api/cron`, `/_next/static`, `/_next/image`, `/favicon.ico`.
- root layout에 `<Toaster />`가 포함되어 있는지 확인 (Phase 7에서 추가했어야 함).
- 모든 Server Action에 세션 검증이 있는지 확인.
- `lib/bible/client.ts`에 `import 'server-only'`가 있는지 확인.

## Acceptance Criteria

```bash
npm run build && npm test
```

빌드 성공 + 모든 테스트 통과.

## AC 검증 방법

위 AC 커맨드를 실행하라. 모두 통과하면 `/tasks/0-mvp/index.json`의 phase 10 status를 `"completed"`로 변경하라.
수정 3회 이상 시도해도 실패하면 status를 `"error"`로 변경하고, 에러 내용을 index.json의 해당 phase에 `"error_message"` 필드로 기록하라.

## 주의사항

- Legal 페이지는 최소한의 내용이면 충분하다. 법률 전문가 검토는 별도로 진행한다.
- cron route에서 `CRON_SECRET`이 없으면 모든 요청이 차단된다. 이건 의도된 동작이다 (빌드는 성공, 런타임에만 영향).
- error.tsx는 반드시 `'use client'`여야 한다. Next.js App Router 규칙.
- 기존 phase에서 만든 모든 코드를 최종 점검하되, 기능을 추가하거나 리팩토링하지 마라. 이 phase는 polish와 infra만 다룬다.
- `vercel.json`이 이미 존재하면 내용을 병합하라. 덮어쓰지 마라.
