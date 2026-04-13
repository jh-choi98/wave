# Phase 2: Database Layer

## 사전 준비

먼저 아래 문서들을 반드시 읽고 프로젝트의 전체 아키텍처와 설계 의도를 완전히 이해하라:

- `/docs/data-schema.md`
- `/docs/code-architecture.md`
- `/docs/adr.md`
- `/tasks/0-mvp/docs-diff.md`

그리고 이전 phase의 작업물을 반드시 확인하라:

- `package.json` (설치된 의존성 확인)
- `src/app/layout.tsx`
- `src/lib/env.ts`
- `tsconfig.json` (alias 설정 확인)

## 작업 내용

Drizzle ORM 스키마와 DB 클라이언트를 구성한다. 실제 DB 연결 없이 타입 시스템만으로 검증한다.

### 1. `src/lib/db/schema.ts`

Drizzle ORM으로 4개 테이블 스키마를 정의한다.

테이블 정의 시 반드시 지킬 규칙:
- `users` 테이블은 Auth.js Drizzle adapter가 요구하는 컬럼을 포함해야 한다 (`id`, `name`, `email`, `emailVerified`, `image`).
- `users`에 `createdAt` 컬럼을 추가한다 (`timestamp`, `defaultNow()`). 이 컬럼은 가입일 기준 통독표 계산에 필수.
- `accounts` 테이블은 Auth.js Drizzle adapter 스키마를 그대로 사용한다.
- `meditations` 테이블: `userId`(text, FK→users.id), `date`(date), `book`(text), `chapter`(integer), `content`(text), `createdAt`, `updatedAt`. UNIQUE constraint는 `(userId, date)`.
- `bible_cache` 테이블: `book`(text), `chapter`(integer), `verses`(jsonb), `cachedAt`. PRIMARY KEY는 `(book, chapter)`.
- Auth.js의 `sessions`, `verificationTokens` 테이블은 정의하지 않는다 (ADR-002: JWT 전략).

Drizzle의 `pgTable`을 사용하고, Auth.js adapter와 호환되는 컬럼명을 사용하라. `@auth/drizzle-adapter` 문서에서 요구하는 정확한 스키마를 따라야 한다.

### 2. `src/lib/db/index.ts`

DB 클라이언트 싱글톤:

```ts
import 'server-only'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

const connectionString = process.env.DATABASE_URL!

const client = postgres(connectionString, { prepare: false })
export const db = drizzle(client, { schema })
```

핵심 규칙:
- `import 'server-only'` 필수 — 클라이언트 번들에 DB 연결이 포함되면 안 됨.
- `prepare: false` — Supabase connection pooler (PgBouncer)와 호환하기 위해 필수.
- 스키마를 drizzle 인스턴스에 전달하여 relational query를 지원.

### 3. `drizzle.config.ts`

```ts
import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema: './src/lib/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
})
```

## Acceptance Criteria

```bash
npm run build
```

빌드가 에러 없이 성공해야 한다. 특히 스키마 파일의 TypeScript 타입 에러가 없어야 한다.

## AC 검증 방법

위 AC 커맨드를 실행하라. 모두 통과하면 `/tasks/0-mvp/index.json`의 phase 2 status를 `"completed"`로 변경하라.
수정 3회 이상 시도해도 실패하면 status를 `"error"`로 변경하고, 에러 내용을 index.json의 해당 phase에 `"error_message"` 필드로 기록하라.

## 주의사항

- `drizzle-kit push`를 실행하지 마라. 스키마 정의만 수행한다. 실제 DB 반영은 배포 전 수동으로.
- `sessions`, `verificationTokens` 테이블을 만들지 마라 (JWT 전략).
- `server-only` 패키지가 없으면 `npm install server-only`로 설치하라.
- DB 클라이언트에서 `process.env.DATABASE_URL!`을 사용하되, `lib/env.ts`의 `validateEnv()`를 이 파일에서 직접 호출하지 마라. 검증은 앱 시작 시 별도로 수행된다.
