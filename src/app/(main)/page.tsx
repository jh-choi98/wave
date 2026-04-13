import { redirect } from 'next/navigation'
import { eq } from 'drizzle-orm'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { getTodayMeditation, getLastMeditation } from '@/actions/meditation'
import { getChapter } from '@/actions/bible'
import { getNextChapter, getChapterByDayOffset } from '@/lib/bible/plan'
import { Header } from '@/components/Header'
import { BiblePassage } from '@/components/BiblePassage'
import { MeditationEditor } from '@/components/MeditationEditor'
import { OnboardingBanner } from '@/components/OnboardingBanner'

function getKSTDateKey(date: Date): string {
  // YYYY-MM-DD in Asia/Seoul
  return date.toLocaleDateString('en-CA', { timeZone: 'Asia/Seoul' })
}

function formatKSTDate(date: Date): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date)
  const year = parts.find((p) => p.type === 'year')?.value ?? ''
  const month = Number(parts.find((p) => p.type === 'month')?.value ?? '0')
  const day = Number(parts.find((p) => p.type === 'day')?.value ?? '0')
  return `${year}년 ${month}월 ${day}일`
}

function daysSince(createdAt: Date): number {
  const MS_PER_DAY = 1000 * 60 * 60 * 24
  const now = Date.now()
  const diff = Math.floor((now - createdAt.getTime()) / MS_PER_DAY)
  return Math.max(0, diff)
}

export default async function HomePage() {
  const session = await auth()
  if (!session?.user?.id) {
    redirect('/login')
  }

  const userId = session.user.id

  const today = await getTodayMeditation()

  let book: string
  let chapter: number

  if (today) {
    book = today.book
    chapter = today.chapter
  } else {
    const last = await getLastMeditation()
    if (last) {
      const next = getNextChapter(last.book, last.chapter)
      book = next.book
      chapter = next.chapter
    } else {
      const rows = await db
        .select({ createdAt: users.createdAt })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1)
      const createdAt = rows[0]?.createdAt ?? new Date()
      const offset = daysSince(createdAt)
      const planned = getChapterByDayOffset(offset)
      book = planned.book
      chapter = planned.chapter
    }
  }

  const verses = await getChapter(book, chapter)
  const now = new Date()
  const dateLabel = formatKSTDate(now)
  const dateKey = getKSTDateKey(now)

  return (
    <div className="flex h-[100dvh] flex-col pb-16">
      <Header
        dateLabel={dateLabel}
        hasSaved={!!today}
        userName={session.user.name}
        userImage={session.user.image}
      />
      <OnboardingBanner />
      <BiblePassage book={book} chapter={chapter} verses={verses} />
      <MeditationEditor
        book={book}
        chapter={chapter}
        initialContent={today?.content ?? ''}
        isCompleted={!!today}
        userId={userId}
        date={dateKey}
      />
    </div>
  )
}
