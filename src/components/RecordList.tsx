'use client'

import { useState, useTransition } from 'react'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { updateMeditation, type Meditation } from '@/actions/meditation'
import { formatDate, formatDateTime } from '@/lib/utils'

export type RecordListProps = {
  records: Meditation[]
}

export function RecordList({ records }: RecordListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')
  const [isPending, startTransition] = useTransition()

  if (records.length === 0) {
    return (
      <div className="flex min-h-[60dvh] items-center justify-center px-6">
        <p className="whitespace-pre-line text-center text-sm text-muted-foreground">
          {'아직 묵상 기록이 없어요.\n홈에서 첫 묵상을 작성해보세요.'}
        </p>
      </div>
    )
  }

  const handleToggle = (id: string) => {
    if (editingId === id) return
    setEditingId(null)
    setExpandedId((prev) => (prev === id ? null : id))
  }

  const handleStartEdit = (record: Meditation) => {
    setEditingId(record.id)
    setEditContent(record.content)
  }

  const handleCancel = () => {
    setEditingId(null)
    setEditContent('')
  }

  const handleSave = (id: string) => {
    const trimmed = editContent.trim()
    if (!trimmed) {
      toast.error('묵상 내용을 입력해주세요')
      return
    }
    startTransition(async () => {
      const result = await updateMeditation(id, trimmed)
      if (result.success) {
        toast.success('수정되었습니다')
        setEditingId(null)
        setEditContent('')
      } else {
        toast.error(result.error ?? '수정에 실패했습니다')
      }
    })
  }

  return (
    <ul className="divide-y">
      {records.map((record) => {
        const isExpanded = expandedId === record.id
        const isEditing = editingId === record.id
        const createdMs = new Date(record.createdAt).getTime()
        const updatedMs = new Date(record.updatedAt).getTime()
        const wasEdited = updatedMs - createdMs > 1000
        const firstLine = record.content.split('\n')[0] ?? ''

        return (
          <li key={record.id}>
            <button
              type="button"
              onClick={() => handleToggle(record.id)}
              className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-muted/50"
            >
              <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                {formatDate(record.date)}
              </span>
              <span className="shrink-0 text-xs font-medium">
                {record.book} {record.chapter}장
              </span>
              <span className="truncate text-xs text-muted-foreground">{firstLine}</span>
            </button>

            {isExpanded && (
              <div className="border-t bg-muted/20 px-4 py-3">
                {isEditing ? (
                  <>
                    <Textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="min-h-32 resize-none"
                      disabled={isPending}
                    />
                    <div className="mt-2 flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCancel}
                        disabled={isPending}
                      >
                        취소
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleSave(record.id)}
                        disabled={isPending}
                      >
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
                  </>
                ) : (
                  <>
                    <p className="whitespace-pre-wrap text-sm leading-relaxed">
                      {record.content}
                    </p>
                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[11px] text-muted-foreground">
                      <div className="flex flex-col">
                        <span>작성 {formatDateTime(record.createdAt)}</span>
                        {wasEdited && <span>수정 {formatDateTime(record.updatedAt)}</span>}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleStartEdit(record)}
                      >
                        수정
                      </Button>
                    </div>
                  </>
                )}
              </div>
            )}
          </li>
        )
      })}
    </ul>
  )
}
