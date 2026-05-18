# WAVE — Code Architecture

## Stack

Next.js (App Router) · Auth.js v5 · Supabase PostgreSQL · Drizzle ORM · Tailwind + shadcn/ui · Vercel

> Observability (PostHog, Sentry) is **deferred to a separate task** after MVP. See ADR-016.

## Project Structure

```
/
├── .env.local                           # local secrets (git-ignored)
├── .env.example                         # template (git-tracked)
├── .gitignore
├── next.config.ts                       # remotePatterns, security headers
├── vercel.json                          # cron job config
├── drizzle.config.ts                    # drizzle-kit migration config
│
└── src/
    ├── middleware.ts                     # auth guard
    ├── app/
    │   ├── layout.tsx                   # root: Pretendard + <html lang="ko">
    │   ├── (auth)/login/page.tsx        # landing page
    │   ├── (main)/
    │   │   ├── layout.tsx               # tab bar (home / records)
    │   │   ├── loading.tsx              # skeleton
    │   │   ├── error.tsx                # error boundary
    │   │   ├── page.tsx                 # home
    │   │   └── records/
    │   │       ├── loading.tsx
    │   │       ├── error.tsx
    │   │       └── page.tsx             # records
    │   ├── privacy/page.tsx             # static
    │   ├── terms/page.tsx               # static
    │   └── api/
    │       ├── auth/[...nextauth]/route.ts
    │       └── cron/ping/route.ts       # Supabase keep-alive
    │
    ├── actions/
    │   ├── meditation.ts                # save, get, list, update
    │   └── bible.ts                     # getChapter (cache-first)
    │
    ├── components/
    │   ├── ui/                          # shadcn primitives
    │   ├── BiblePassage.tsx             # verse display
    │   ├── MeditationEditor.tsx         # textarea + save (Client)
    │   ├── PassageSelector.tsx          # bottom sheet (Client)
    │   └── RecordList.tsx               # list + inline expand (Client)
    │
    ├── lib/
    │   ├── db/
    │   │   ├── schema.ts               # Drizzle table definitions
    │   │   └── index.ts                # singleton client (pooled)
    │   ├── bible/
    │   │   ├── client.ts               # BibleClient interface + Mock/Api impls (server-only)
    │   │   ├── plan.ts                 # next chapter calculation
    │   │   └── books.ts                # 66-book validation constants
    │   ├── auth.ts                     # Auth.js config (JWT strategy)
    │   └── env.ts                      # startup env validation
    │
    └── hooks/
        └── useDraft.ts                 # localStorage draft management
```

## Rendering Strategy

```
Home (Server Component)
├── session check
├── today's meditation query (DB)
├── next chapter calculation (plan.ts)
├── bible text fetch (bible_cache → API fallback)
└── renders:
    ├── BiblePassage (Server)
    └── MeditationEditor (Client) ← only interactive part
```

- **Read path**: Server Component → Drizzle → Supabase PostgreSQL
- **Write path**: Client Component → Server Action → Drizzle → Supabase PostgreSQL
- **No custom API routes** for app logic. All mutations via Server Actions.

## Middleware

```ts
// Protected: /, /records
// Public: /login, /privacy, /terms, /api/auth, /api/cron, /_next
export const config = {
  matcher: [
    '/((?!api/auth|api/cron|login|privacy|terms|_next/static|_next/image|favicon.ico).*)'
  ]
}
```

## Server Action Security

Every Server Action must:
1. Verify session exists (`auth()`)
2. Verify resource ownership (`user_id === session.user.id`)
3. Validate inputs (book in 66-book list, chapter in range, content non-empty, content ≤ 10,000 chars)

## Bible Data Flow

`lib/bible/client.ts` defines a `BibleClient` interface with two implementations:

- **`MockBibleClient`** (dev / MVP): returns static JSON for any book/chapter.
- **`ApiBibleClient`** (prod, future): fetches from scripture.api.bible. Not implemented in MVP — see ADR-015.

```
Client requests chapter
  → Server Action: check bible_cache
    → cache hit → return verses
    → cache miss → BibleClient.getChapter(book, chapter) → store in bible_cache → return
```

The module uses `import 'server-only'` to prevent any future API key leakage. Swapping implementations is a single-line change at the factory.

## Caching & Revalidation

- `revalidatePath('/')` and `revalidatePath('/records')` after every meditation save/update.
- Bible cache: permanent (no TTL). Bible text is immutable.
- Supabase keep-alive: Vercel Cron every 6 days (`SELECT 1`).

## Environment Variables

```
# Secrets (server-only)
NEXTAUTH_SECRET, NEXTAUTH_URL
GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET
DATABASE_URL                    # pooled connection, port 6543
SCRIPTURE_API_KEY               # unused in MVP (MockBibleClient); required for ApiBibleClient
CRON_SECRET
```

Validated at runtime only in `lib/env.ts`. Missing required vars → throw immediately on server startup. Build time does not invoke the validator (see ADR-017), so `npm run build` and tests pass without real credentials.

## next.config.ts

```ts
// Required configs:
images: { remotePatterns: [{ hostname: 'lh3.googleusercontent.com' }] }
headers: [
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' }
]
```

## Mobile

- Split layout: top = bible text (scrollable), bottom = textarea (fixed)
- Keyboard open: bible text area minimized. CSS `dvh` + `visualViewport` API.
