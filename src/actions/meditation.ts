'use server'

import { and, desc, eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { meditations } from '@/lib/db/schema'
import { validateMeditationInput } from '@/lib/validators'

export type Meditation = typeof meditations.$inferSelect

function getKSTDate(): string {
  // 'en-CA' locale returns YYYY-MM-DD format
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Seoul' })
}

export async function saveMeditation(
  book: string,
  chapter: number,
  content: string
): Promise<{ success: boolean; error?: string }> {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: 'Unauthorized' }
  }

  const validation = validateMeditationInput(book, chapter, content)
  if (!validation.valid) {
    return { success: false, error: validation.error }
  }

  const today = getKSTDate()
  const now = new Date()

  try {
    await db
      .insert(meditations)
      .values({
        userId: session.user.id,
        date: today,
        book,
        chapter,
        content,
      })
      .onConflictDoUpdate({
        target: [meditations.userId, meditations.date],
        set: {
          book,
          chapter,
          content,
          updatedAt: now,
        },
      })
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '저장에 실패했습니다.',
    }
  }

  revalidatePath('/')
  revalidatePath('/records')

  return { success: true }
}

export async function getTodayMeditation(): Promise<Meditation | null> {
  const session = await auth()
  if (!session?.user?.id) throw new Error('Unauthorized')

  const today = getKSTDate()

  const rows = await db
    .select()
    .from(meditations)
    .where(and(eq(meditations.userId, session.user.id), eq(meditations.date, today)))
    .limit(1)

  return rows[0] ?? null
}

export async function getLastMeditation(): Promise<{ book: string; chapter: number } | null> {
  const session = await auth()
  if (!session?.user?.id) throw new Error('Unauthorized')

  const rows = await db
    .select({ book: meditations.book, chapter: meditations.chapter })
    .from(meditations)
    .where(eq(meditations.userId, session.user.id))
    .orderBy(desc(meditations.date))
    .limit(1)

  return rows[0] ?? null
}

export async function getMeditationRecords(): Promise<Meditation[]> {
  const session = await auth()
  if (!session?.user?.id) throw new Error('Unauthorized')

  return await db
    .select()
    .from(meditations)
    .where(eq(meditations.userId, session.user.id))
    .orderBy(desc(meditations.date))
}
