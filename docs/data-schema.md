# WAVE — Data Schema

## Tables

### users (Auth.js managed + extended)

Auth.js Drizzle adapter manages this table. `created_at` is our addition for Bible plan calculation.

```sql
CREATE TABLE users (
  id              text PRIMARY KEY,
  name            text,
  email           text UNIQUE,
  email_verified  timestamptz,
  image           text,
  created_at      timestamptz DEFAULT now()  -- added: join date for reading plan
);
```

### accounts (Auth.js managed)

Auth.js default schema. No modifications.

### meditations

```sql
CREATE TABLE meditations (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date        date NOT NULL,
  book        text NOT NULL,
  chapter     integer NOT NULL,
  content     text NOT NULL,
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now(),
  UNIQUE (user_id, date)
);
```

- `UNIQUE (user_id, date)`: enforces one meditation per user per day. All writes use UPSERT.
- `date`: KST date, not UTC.
- `updated_at`: set explicitly in Server Action on each save. No DB trigger.

### bible_cache

```sql
CREATE TABLE bible_cache (
  book       text NOT NULL,
  chapter    integer NOT NULL,
  verses     jsonb NOT NULL,
  cached_at  timestamptz DEFAULT now(),
  PRIMARY KEY (book, chapter)
);
```

- `verses` format: `[{"verse": 1, "text": "태초에 하나님이..."}, ...]`
- No TTL. Bible text doesn't change. Cache is permanent.
- Purpose: eliminate scripture.api.bible dependency after first fetch (5,000 req/month free limit).

## Key Queries

```sql
-- Today's meditation
SELECT * FROM meditations WHERE user_id = ? AND date = ?;

-- Last meditation (for next chapter calculation)
SELECT book, chapter FROM meditations WHERE user_id = ? ORDER BY date DESC LIMIT 1;

-- Records list (newest first)
SELECT * FROM meditations WHERE user_id = ? ORDER BY date DESC;

-- Bible chapter (cache lookup)
SELECT verses FROM bible_cache WHERE book = ? AND chapter = ?;
```

## Chapter Calculation Logic

```
1. Has meditation today? → show that chapter
2. Has any past meditation? → last chapter + 1
3. No meditation (new user)? → (today - created_at).days mapped to 1,189-chapter plan
4. After Revelation 22 → wraps to Genesis 1
```
