# Phase 3: Auth

## 사전 준비

먼저 아래 문서들을 반드시 읽고 프로젝트의 전체 아키텍처와 설계 의도를 완전히 이해하라:

- `/docs/code-architecture.md` (Middleware 섹션, Rendering Strategy 섹션)
- `/docs/adr.md` (ADR-001, ADR-002)
- `/docs/flow.md` (Flow 1: Entry / Auth)
- `/tasks/0-mvp/docs-diff.md`

그리고 이전 phase의 작업물을 반드시 확인하라:

- `src/lib/db/schema.ts` (users, accounts 테이블 스키마)
- `src/lib/db/index.ts` (DB 클라이언트)
- `src/app/layout.tsx` (root layout)
- `package.json` (설치된 의존성)

## 작업 내용

Auth.js v5 (next-auth@beta)로 Google OAuth 인증을 구성한다.

### 1. `src/lib/auth.ts`

Auth.js v5 설정:

```ts
import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'
import { DrizzleAdapter } from '@auth/drizzle-adapter'
import { db } from '@/lib/db'
```

핵심 규칙:
- `adapter`: `DrizzleAdapter(db)` — 이전 phase에서 정의한 DB 스키마와 연결.
- `providers`: `Google` — `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` 환경변수 사용.
- `session.strategy`: `'jwt'` — DB 세션 없음 (ADR-002).
- `pages.signIn`: `'/login'` — 커스텀 로그인 페이지로 리다이렉트.
- `callbacks.session`: JWT에서 `user.id`를 세션에 포함시켜야 한다. Server Action에서 소유권 검증에 필요.

export 해야 할 것: `handlers` (GET, POST), `auth`, `signIn`, `signOut`.

### 2. `src/app/api/auth/[...nextauth]/route.ts`

```ts
import { handlers } from '@/lib/auth'
export const { GET, POST } = handlers
```

### 3. `src/middleware.ts`

인증 미들웨어:

```ts
export { auth as middleware } from '@/lib/auth'
```

`config.matcher`로 공개 경로를 제외:
- `/login`, `/privacy`, `/terms` — 비로그인 접근 필수
- `/api/auth` — Auth.js 콜백
- `/api/cron` — Supabase keep-alive
- `/_next/static`, `/_next/image`, `/favicon.ico` — 정적 자산

비로그인 유저가 보호된 경로에 접근하면 `/login`으로 리다이렉트한다. Auth.js v5의 `auth` 미들웨어와 `authorized` 콜백을 활용하라.

### 4. `src/app/(auth)/login/page.tsx`

랜딩 페이지:

- 앱 이름 "WAVE"를 크게 표시.
- 부제: "매일 한 장, 묵상" 또는 유사한 짧은 소개.
- "Google로 시작하기" 로그인 버튼 1개.
- 버튼 클릭 시 `signIn('google', { redirectTo: '/' })` 호출.
- 심플하고 깔끔한 디자인. 포인트 색상 1개 + 무채색.
- 이 페이지는 Client Component (`'use client'`)로 구현한다.

shadcn/ui `Button` 컴포넌트를 설치하여 사용하라:
```bash
npx shadcn@latest add button
```

### 5. `src/app/(auth)/layout.tsx`

auth 라우트 그룹 레이아웃. 로그인 페이지를 화면 중앙에 배치하는 간단한 레이아웃.

## Acceptance Criteria

```bash
npm run build
```

빌드가 에러 없이 성공해야 한다.

## AC 검증 방법

위 AC 커맨드를 실행하라. 모두 통과하면 `/tasks/0-mvp/index.json`의 phase 3 status를 `"completed"`로 변경하라.
수정 3회 이상 시도해도 실패하면 status를 `"error"`로 변경하고, 에러 내용을 index.json의 해당 phase에 `"error_message"` 필드로 기록하라.

## 주의사항

- `NEXTAUTH_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` 환경변수가 없어도 빌드는 성공해야 한다 (ADR-017: 런타임 전용 검증).
- `sessions`, `verificationTokens` 관련 코드를 추가하지 마라.
- 미들웨어에서 `api/cron` 경로를 반드시 제외하라. 그렇지 않으면 Supabase keep-alive cron이 인증에 막힌다.
- Auth.js v5의 `auth()` 함수가 서버 컴포넌트에서 호출 가능하도록 설정하라. 이후 phase의 Server Action에서 `auth()`로 세션을 확인한다.
- 로그인 페이지에 불필요한 소셜 로그인 버튼이나 이메일 입력을 추가하지 마라. Google 버튼 1개만.
