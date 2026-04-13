import {
  pgTable,
  text,
  timestamp,
  integer,
  date,
  jsonb,
  uuid,
  primaryKey,
  unique,
} from 'drizzle-orm/pg-core'

// Auth.js Drizzle adapter — users + accounts only (JWT strategy, ADR-002)
export const users = pgTable('user', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text('name'),
  email: text('email').unique(),
  emailVerified: timestamp('emailVerified', { mode: 'date' }),
  image: text('image'),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
})

export const accounts = pgTable(
  'account',
  {
    userId: text('userId')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    type: text('type').notNull(),
    provider: text('provider').notNull(),
    providerAccountId: text('providerAccountId').notNull(),
    refresh_token: text('refresh_token'),
    access_token: text('access_token'),
    expires_at: integer('expires_at'),
    token_type: text('token_type'),
    scope: text('scope'),
    id_token: text('id_token'),
    session_state: text('session_state'),
  },
  (account) => ({
    compositePk: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  })
)

export const meditations = pgTable(
  'meditations',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    date: date('date').notNull(),
    book: text('book').notNull(),
    chapter: integer('chapter').notNull(),
    content: text('content').notNull(),
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow().notNull(),
  },
  (table) => ({
    userDateUnique: unique('meditations_user_id_date_unique').on(table.userId, table.date),
  })
)

export const bibleCache = pgTable(
  'bible_cache',
  {
    book: text('book').notNull(),
    chapter: integer('chapter').notNull(),
    verses: jsonb('verses').notNull(),
    cachedAt: timestamp('cached_at', { mode: 'date' }).defaultNow().notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.book, table.chapter] }),
  })
)
