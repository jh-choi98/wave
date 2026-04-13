# docs-diff: mvp

Baseline: `ce3c072`

## `docs/adr.md`

```diff
diff --git a/docs/adr.md b/docs/adr.md
index 5e0403f..8a2622c 100644
--- a/docs/adr.md
+++ b/docs/adr.md
@@ -101,3 +101,23 @@ Fast MVP launch for YC. Minimize complexity. Ship only what's needed. No specula
 **Decision**: Records tab expands items inline. No separate detail screen.
 
 **Why**: Two-screen constraint (home + records). Detail page would be a third screen. Inline expansion keeps context — user sees the list while reading a specific entry. Edit mode via explicit [수정] button prevents accidental edits.
+
+## ADR-015: Mock Bible Data for Development
+
+**Decision**: During development, use mock/static JSON instead of scripture.api.bible. `lib/bible/client.ts` is defined as an interface (`BibleClient`) with a `MockBibleClient` implementation for dev and a future `ApiBibleClient` implementation for production.
+
+**Why**: scripture.api.bible key issuance and Korean 개역개정 availability are unverified. Mock data lets us complete the full flow (login → passage → meditation → records) first and defer real API integration to a separate task.
+
+**Trade-off**: Developing without real data means the real API response shape may differ. The interface abstraction minimizes this risk — swapping implementations should not touch callers.
+
+## ADR-016: PostHog/Sentry Deferred
+
+**Decision**: PostHog and Sentry are excluded from the MVP task. They will be added as a separate task after the core flow (login → passage → meditation → records) is complete.
+
+**Why**: More phases mean longer runs and higher failure probability. Observability can be attached after the core feature works — it does not need to block first launch.
+
+## ADR-017: Runtime-Only Env Validation
+
+**Decision**: Environment variables are validated only at runtime. No build-time checks.
+
+**Why**: CI/CD and phase-level AC checks (`npm run build`, `npm test`) must pass without real DB/OAuth credentials. `lib/env.ts` is invoked on runtime startup; if a required variable is missing, it throws immediately. Build never touches the validator.
```

## `docs/code-architecture.md`

```diff
diff --git a/docs/code-architecture.md b/docs/code-architecture.md
index 07b55f5..c27b215 100644
--- a/docs/code-architecture.md
+++ b/docs/code-architecture.md
@@ -4,6 +4,8 @@
 
 Next.js (App Router) · Auth.js v5 · Supabase PostgreSQL · Drizzle ORM · Tailwind + shadcn/ui · Vercel
 
+> Observability (PostHog, Sentry) is **deferred to a separate task** after MVP. See ADR-016.
+
 ## Project Structure
 
 ```
@@ -18,7 +20,7 @@ Next.js (App Router) · Auth.js v5 · Supabase PostgreSQL · Drizzle ORM · Tail
 └── src/
     ├── middleware.ts                     # auth guard
     ├── app/
-    │   ├── layout.tsx                   # root: Pretendard, PostHog, Sentry
+    │   ├── layout.tsx                   # root: Pretendard + <html lang="ko">
     │   ├── (auth)/login/page.tsx        # landing page
     │   ├── (main)/
     │   │   ├── layout.tsx               # tab bar (home / records)
@@ -51,7 +53,7 @@ Next.js (App Router) · Auth.js v5 · Supabase PostgreSQL · Drizzle ORM · Tail
     │   │   ├── schema.ts               # Drizzle table definitions
     │   │   └── index.ts                # singleton client (pooled)
     │   ├── bible/
-    │   │   ├── client.ts               # scripture.api.bible (server-only)
+    │   │   ├── client.ts               # BibleClient interface + Mock/Api impls (server-only)
     │   │   ├── plan.ts                 # next chapter calculation
     │   │   └── books.ts                # 66-book validation constants
     │   ├── auth.ts                     # Auth.js config (JWT strategy)
@@ -99,14 +101,19 @@ Every Server Action must:
 
 ## Bible Data Flow
 
+`lib/bible/client.ts` defines a `BibleClient` interface with two implementations:
+
+- **`MockBibleClient`** (dev / MVP): returns static JSON for any book/chapter.
+- **`ApiBibleClient`** (prod, future): fetches from scripture.api.bible. Not implemented in MVP — see ADR-015.
+
 ```
 Client requests chapter
   → Server Action: check bible_cache
     → cache hit → return verses
-    → cache miss → fetch scripture.api.bible → store in bible_cache → return
+    → cache miss → BibleClient.getChapter(book, chapter) → store in bible_cache → return
 ```
 
-`lib/bible/client.ts` uses `import 'server-only'` to prevent API key leakage.
+The module uses `import 'server-only'` to prevent any future API key leakage. Swapping implementations is a single-line change at the factory.
 
 ## Caching & Revalidation
 
@@ -121,16 +128,11 @@ Client requests chapter
 NEXTAUTH_SECRET, NEXTAUTH_URL
 GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET
 DATABASE_URL                    # pooled connection, port 6543
-SCRIPTURE_API_KEY
-SENTRY_DSN
+SCRIPTURE_API_KEY               # unused in MVP (MockBibleClient); required for ApiBibleClient
 CRON_SECRET
-
-# Public (client-safe)
-NEXT_PUBLIC_POSTHOG_KEY
-NEXT_PUBLIC_POSTHOG_HOST
 ```
 
-Validated at startup in `lib/env.ts`. Missing required vars → throw immediately.
+Validated at runtime only in `lib/env.ts`. Missing required vars → throw immediately on server startup. Build time does not invoke the validator (see ADR-017), so `npm run build` and tests pass without real credentials.
 
 ## next.config.ts
 
```

## `docs/data-schema.md`

```diff
diff --git a/docs/data-schema.md b/docs/data-schema.md
index ea8a1c8..3c27415 100644
--- a/docs/data-schema.md
+++ b/docs/data-schema.md
@@ -56,6 +56,7 @@ CREATE TABLE bible_cache (
 - `verses` format: `[{"verse": 1, "text": "태초에 하나님이..."}, ...]`
 - No TTL. Bible text doesn't change. Cache is permanent.
 - Purpose: eliminate scripture.api.bible dependency after first fetch (5,000 req/month free limit).
+- **MVP note**: MVP uses a `MockBibleClient` (see ADR-015), so seed rows can be inserted directly into this table during development. When the real API is wired up, the cache-first pattern above takes over unchanged.
 
 ## Key Queries
 
```
