# WAVE — Architecture Decision Records

## Philosophy

Fast MVP launch for YC. Minimize complexity. Ship only what's needed. No speculative features.

---

## ADR-001: Auth.js v5 over NextAuth v4

**Decision**: Use Auth.js v5 (RC) with `@auth/drizzle-adapter`.

**Why**: NextAuth v4 has no official Drizzle adapter. v4 + custom adapter = extra code. v5 + `@auth/drizzle-adapter` works out of the box. v5 RC is stable enough for MVP.

**Trade-off**: v5 is technically RC, not GA. Acceptable risk for MVP speed.

## ADR-002: JWT Sessions, Not Database Sessions

**Decision**: JWT strategy. No `sessions` or `verification_tokens` tables.

**Why**: Stateless. One fewer table. No session cleanup needed. For an app with no session revocation requirements, DB sessions add complexity for no benefit.

## ADR-003: Server Actions over API Routes

**Decision**: All app mutations via Server Actions. No custom API routes (except cron ping and auth).

**Why**: Type-safe end-to-end. Less boilerplate. No manual request/response handling. Natural fit with App Router Server Components.

## ADR-004: Supabase as PostgreSQL Only

**Decision**: Use Supabase solely for PostgreSQL. No Supabase Auth, Realtime, Storage, or Edge Functions.

**Why**: We need a free hosted PostgreSQL. Supabase provides that. Using their proprietary features would create vendor lock-in and add unnecessary abstraction layers.

**Risk**: Free tier auto-pauses after 7 days inactivity. Mitigated with Vercel Cron ping.

## ADR-005: Drizzle ORM over Prisma

**Decision**: Drizzle ORM with drizzle-kit for migrations.

**Why**: Lighter than Prisma. No separate binary. SQL-like API reduces abstraction surprise. Better cold-start performance on serverless (Vercel). Official Auth.js adapter available.

## ADR-006: scripture.api.bible + DB Cache

**Decision**: Fetch Bible text from scripture.api.bible, cache in `bible_cache` table permanently.

**Why**: Free API tier is 5,000 req/month. Caching makes each chapter a one-time fetch (1,189 chapters total). After warm-up, zero API dependency. Bible text is immutable — no cache invalidation needed.

**Risk**: Korean 개역개정 availability on this API is unverified. Must confirm on Day 0 before writing code.

## ADR-007: Progress-Based Reading Plan, Not Calendar-Based

**Decision**: Next chapter = last meditated chapter + 1. Not tied to calendar days.

**Why**: Calendar-based plan creates pressure when users miss days. Progress-based lets users go at their own pace. Manual chapter selection overrides the position, so users are never stuck.

**Fallback for new users**: Days since `created_at` mapped to the 1,189-chapter sequence. This gives a starting point without requiring onboarding configuration.

## ADR-008: KST Hardcoded, Not User Timezone

**Decision**: All date logic uses Asia/Seoul timezone.

**Why**: Target market is Korea. Timezone selection UI adds complexity for negligible benefit at MVP stage. "Today" boundary is midnight KST for all users.

## ADR-009: localStorage Draft with Chapter Context

**Decision**: Draft auto-saves `{ book, chapter, content }` to localStorage, keyed by `draft_${userId}_${date}`.

**Why**:
- Includes chapter to prevent mismatch on restore (user selected John 3, but auto-assignment shows Genesis 4).
- Includes userId to prevent cross-user contamination on shared devices.
- Includes date to auto-discard stale drafts (yesterday's draft is irrelevant).
- localStorage over server-side draft: no extra API calls, no DB writes for unfinished work.

## ADR-010: Bottom Sheet for Passage Selection

**Decision**: Book/chapter selection via bottom sheet with 구약/신약 tabs → book list → chapter grid. Chapter selection immediately applies (no confirm button).

**Why**: Mobile-first app. Bottom sheet is thumb-reachable. Two-step drill-down (book → chapter) reduces cognitive load vs. two parallel dropdowns. Instant apply removes unnecessary friction.

## ADR-011: PostHog for Analytics, Not Vercel Analytics

**Decision**: PostHog (self-serve, free tier).

**Why**: YC MVP needs hypothesis testing — which features drive retention, where users drop off. Vercel Analytics only provides page views. PostHog gives event tracking, funnels, and cohort analysis. PII must not be sent (PIPA compliance).

## ADR-012: Pretendard Font

**Decision**: Pretendard via `next/font/local`.

**Why**: Bible reading is the core experience. System fonts vary across devices. Pretendard is free, optimized for Korean readability, and supported by Next.js font optimization (no FOUT).

## ADR-013: Split Layout with Keyboard Handling

**Decision**: Home screen uses fixed split — top: scrollable Bible text, bottom: fixed textarea. On mobile keyboard open, Bible text area minimizes.

**Why**: Users read Bible text and write simultaneously. Single scroll forces losing position. Split layout preserves reading context. `dvh` + `visualViewport` API handles keyboard resize.

## ADR-014: Inline Record Expansion, Not Detail Page

**Decision**: Records tab expands items inline. No separate detail screen.

**Why**: Two-screen constraint (home + records). Detail page would be a third screen. Inline expansion keeps context — user sees the list while reading a specific entry. Edit mode via explicit [수정] button prevents accidental edits.
