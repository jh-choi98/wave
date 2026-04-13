'use client'

export type MeditationEditorProps = {
  book: string
  chapter: number
  initialContent?: string
  hasSaved?: boolean
}

export function MeditationEditor({
  book,
  chapter,
  initialContent = '',
  hasSaved = false,
}: MeditationEditorProps) {
  return (
    <section className="border-t bg-background px-4 py-3">
      <div className="text-xs text-muted-foreground">
        {book} {chapter}장 {hasSaved ? '· 저장됨' : ''}
      </div>
      <div className="mt-2 text-sm text-muted-foreground">
        {initialContent || '묵상 입력 (Phase 7에서 구현)'}
      </div>
    </section>
  )
}
