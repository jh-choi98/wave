# Phase 1: Project Scaffold

## 사전 준비

먼저 아래 문서들을 반드시 읽고 프로젝트의 전체 아키텍처와 설계 의도를 완전히 이해하라:

- `/docs/code-architecture.md`
- `/docs/adr.md`
- `/tasks/0-mvp/docs-diff.md` (이번 task의 문서 변경 기록)

## 작업 내용

Next.js 프로젝트를 초기화하고 모든 의존성과 설정 파일을 구성한다.

### 1. Next.js 프로젝트 초기화

프로젝트 루트에서 `create-next-app`을 실행한다. 이미 루트에 파일들이 존재하므로 (docs/, scripts/, tasks/ 등), 임시 디렉토리에 생성 후 필요한 파일들을 루트로 이동하는 방식을 사용하라.

설정:
- TypeScript: yes
- ESLint: yes
- Tailwind CSS: yes
- `src/` directory: yes
- App Router: yes
- import alias: `@/`

### 2. 추가 의존성 설치

```bash
# DB
npm install drizzle-orm postgres
npm install -D drizzle-kit

# Auth
npm install next-auth@beta @auth/drizzle-adapter

# UI
npx shadcn@latest init  # default style, neutral color, CSS variables: yes

# Test
npm install -D vitest @vitejs/plugin-react
```

shadcn/ui 초기화 시 기본 옵션을 사용한다. 이후 필요한 컴포넌트는 각 phase에서 개별 설치한다.

### 3. Pretendard 폰트

Pretendard variable 폰트 파일을 프로젝트에 포함한다.

```bash
# public/fonts/ 디렉토리에 Pretendard variable woff2 파일 다운로드
mkdir -p public/fonts
curl -L -o public/fonts/PretendardVariable.woff2 "https://github.com/orioncactus/pretendard/raw/main/packages/pretendard/dist/web/variable/woff2/PretendardVariable.woff2"
```

### 4. 설정 파일들

**`next.config.ts`**:
```ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { hostname: 'lh3.googleusercontent.com' },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ]
  },
}

export default nextConfig
```

**`.env.example`**:
```
# Auth
NEXTAUTH_SECRET=
NEXTAUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Database (Supabase pooled connection, port 6543)
DATABASE_URL=

# Bible API (deferred — using mock for MVP)
SCRIPTURE_API_KEY=

# Cron
CRON_SECRET=
```

**`.gitignore`** — Next.js 기본 + 추가:
```
# dependencies
/node_modules
/.pnp
.pnp.js

# next.js
/.next/
/out/

# env
.env
.env.local
.env.*.local

# misc
.DS_Store
*.pem

# debug
npm-debug.log*

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts
```

### 5. `src/lib/env.ts`

환경변수 검증 유틸리티. 런타임에만 호출되도록 한다.

```ts
// 런타임 전용 환경변수 검증
// 빌드 타임에는 호출하지 않는다 (ADR-017)
export function validateEnv() {
  const required = [
    'NEXTAUTH_SECRET',
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
    'DATABASE_URL',
  ] as const

  const missing = required.filter((key) => !process.env[key])

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`)
  }
}
```

### 6. Root Layout (`src/app/layout.tsx`)

```tsx
import type { Metadata } from 'next'
import localFont from 'next/font/local'
import './globals.css'

const pretendard = localFont({
  src: '../../public/fonts/PretendardVariable.woff2',
  variable: '--font-pretendard',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'WAVE — Word And Verse Everyday',
  description: '매일 성경 한 장, 묵상을 기록하세요',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className={pretendard.variable}>
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  )
}
```

### 7. Tailwind 폰트 설정

`tailwind.config.ts`에서 Pretendard를 sans 폰트로 설정:

```ts
fontFamily: {
  sans: ['var(--font-pretendard)', 'system-ui', 'sans-serif'],
},
```

### 8. Vitest 설정

`vitest.config.ts`:
```ts
import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    globals: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

`package.json`에 test script 추가:
```json
"scripts": {
  "test": "vitest run"
}
```

### 9. 임시 홈페이지

`src/app/page.tsx`를 간단한 "WAVE" 타이틀만 표시하는 페이지로 교체한다. 이후 phase에서 실제 라우트 구조로 대체된다.

## Acceptance Criteria

```bash
npm run build
```

빌드가 에러 없이 성공해야 한다.

## AC 검증 방법

위 AC 커맨드를 실행하라. 모두 통과하면 `/tasks/0-mvp/index.json`의 phase 1 status를 `"completed"`로 변경하라.
수정 3회 이상 시도해도 실패하면 status를 `"error"`로 변경하고, 에러 내용을 index.json의 해당 phase에 `"error_message"` 필드로 기록하라.

## 주의사항

- `create-next-app` 실행 시 기존 docs/, scripts/, tasks/ 디렉토리를 삭제하지 마라.
- `.env.local` 파일을 생성하지 마라 (실제 크레덴셜이 없음).
- PostHog, Sentry 관련 패키지를 설치하지 마라 (ADR-016).
- shadcn/ui 컴포넌트를 미리 설치하지 마라. 이 phase에서는 init만 수행.
