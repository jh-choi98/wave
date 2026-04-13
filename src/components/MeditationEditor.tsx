'use client'

import { useEffect, useState, useTransition } from 'react'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { saveMeditation } from '@/actions/meditation'
import { useDraft } from '@/hooks/useDraft'

export type MeditationEditorProps = {
  book: string
  chapter: number
  initialContent?: string
  isCompleted: boolean
  userId: string
  date: string
}

export function MeditationEditor({
  book,
  chapter,
  initialContent = '',
  isCompleted,
  userId,
  date,
}: MeditationEditorProps) {
  const [content, setContent] = useState(initialContent)
  const [hydrated, setHydrated] = useState(false)
  const [isPending, startTransition] = useTransition()
  const { draft, saveDraft, clearDraft } = useDraft(userId, date)

  // Restore from draft only when there is no initialContent (DB wins).
  useEffect(() => {
    if (hydrated) return
    if (!initialContent && draft && draft.book === book && draft.chapter === chapter) {
      setContent(draft.content)
    }
    setHydrated(true)
  }, [draft, initialContent, hydrated, book, chapter])

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const next = e.target.value
    setContent(next)
    if (hydrated) {
      saveDraft({ book, chapter, content: next })
    }
  }

  const handleSave = () => {
    const trimmed = content.trim()
    if (!trimmed) {
      toast.error('묵상 내용을 입력해주세요')
      return
    }
    startTransition(async () => {
      const result = await saveMeditation(book, chapter, trimmed)
      if (result.success) {
        clearDraft()
        toast.success('저장되었습니다')
      } else {
        toast.error(result.error ?? '저장에 실패했습니다')
      }
    })
  }

  return (
    <section className="border-t bg-background px-4 py-3">
      {isCompleted && (
        <div className="mb-2 inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
          ✓ 오늘 묵상 완료
        </div>
      )}
      <Textarea
        value={content}
        onChange={handleChange}
        placeholder="오늘의 묵상을 적어보세요"
        className="min-h-24 resize-none"
        disabled={isPending}
      />
      <div className="mt-2 flex justify-end">
        <Button onClick={handleSave} disabled={isPending} size="sm">
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              저장 중…
            </>
          ) : (
            '저장'
          )}
        </Button>
      </div>
    </section>
  )
}
