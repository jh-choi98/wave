'use client'

import { useState } from 'react'
import { ChevronLeft, Check } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import {
  BIBLE_BOOKS,
  NEW_TESTAMENT,
  OLD_TESTAMENT,
  type BibleBook,
} from '@/lib/bible/books'
import { cn } from '@/lib/utils'

export type PassageSelectorProps = {
  currentBook: string
  currentChapter: number
  onSelect: (book: string, chapter: number) => void
}

export function PassageSelector({
  currentBook,
  currentChapter,
  onSelect,
}: PassageSelectorProps) {
  const [open, setOpen] = useState(false)
  const [selectedBook, setSelectedBook] = useState<BibleBook | null>(null)

  const currentTestament: 'old' | 'new' =
    BIBLE_BOOKS.find((b) => b.name === currentBook)?.testament ?? 'old'

  const handleOpenChange = (next: boolean) => {
    setOpen(next)
    if (!next) {
      // Reset to book list when sheet closes
      setSelectedBook(null)
    }
  }

  const handleBookTap = (book: BibleBook) => {
    setSelectedBook(book)
  }

  const handleChapterTap = (chapter: number) => {
    if (!selectedBook) return
    onSelect(selectedBook.name, chapter)
    setOpen(false)
    // reset after close animation
    setTimeout(() => setSelectedBook(null), 200)
  }

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        <Button size="sm" variant="outline">
          변경
        </Button>
      </SheetTrigger>
      <SheetContent
        side="bottom"
        className="flex !h-[80dvh] flex-col gap-0 p-0"
        showCloseButton={false}
      >
        {selectedBook ? (
          <>
            <SheetHeader className="flex-row items-center gap-2 border-b px-3 py-2">
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setSelectedBook(null)}
                aria-label="뒤로"
              >
                <ChevronLeft />
              </Button>
              <SheetTitle className="text-base">{selectedBook.name}</SheetTitle>
            </SheetHeader>
            <div className="flex-1 overflow-y-auto p-3">
              <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
                {Array.from({ length: selectedBook.chapters }, (_, i) => i + 1).map(
                  (ch) => {
                    const isCurrent =
                      selectedBook.name === currentBook && ch === currentChapter
                    return (
                      <button
                        key={ch}
                        type="button"
                        onClick={() => handleChapterTap(ch)}
                        className={cn(
                          'flex aspect-square items-center justify-center rounded-md border text-sm font-medium transition-colors',
                          isCurrent
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'border-border bg-background hover:bg-accent'
                        )}
                      >
                        {ch}
                      </button>
                    )
                  }
                )}
              </div>
            </div>
          </>
        ) : (
          <>
            <SheetHeader className="border-b px-4 py-3">
              <SheetTitle>본문 선택</SheetTitle>
            </SheetHeader>
            <Tabs
              defaultValue={currentTestament}
              className="flex flex-1 flex-col overflow-hidden"
            >
              <div className="px-4 pt-3">
                <TabsList className="w-full">
                  <TabsTrigger value="old" className="flex-1">
                    구약
                  </TabsTrigger>
                  <TabsTrigger value="new" className="flex-1">
                    신약
                  </TabsTrigger>
                </TabsList>
              </div>
              <TabsContent
                value="old"
                className="mt-0 min-h-0 flex-1 overflow-y-auto px-2 py-2"
              >
                <BookList
                  books={OLD_TESTAMENT}
                  currentBook={currentBook}
                  onTap={handleBookTap}
                />
              </TabsContent>
              <TabsContent
                value="new"
                className="mt-0 min-h-0 flex-1 overflow-y-auto px-2 py-2"
              >
                <BookList
                  books={NEW_TESTAMENT}
                  currentBook={currentBook}
                  onTap={handleBookTap}
                />
              </TabsContent>
            </Tabs>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}

function BookList({
  books,
  currentBook,
  onTap,
}: {
  books: BibleBook[]
  currentBook: string
  onTap: (book: BibleBook) => void
}) {
  return (
    <ul className="divide-y">
      {books.map((book) => {
        const isCurrent = book.name === currentBook
        return (
          <li key={book.name}>
            <button
              type="button"
              onClick={() => onTap(book)}
              className="flex w-full items-center justify-between px-3 py-3 text-left text-sm hover:bg-accent"
            >
              <span className={cn(isCurrent && 'font-semibold text-primary')}>
                {book.name}
              </span>
              <span className="flex items-center gap-2 text-xs text-muted-foreground">
                {book.chapters}장
                {isCurrent && <Check className="h-4 w-4 text-primary" />}
              </span>
            </button>
          </li>
        )
      })}
    </ul>
  )
}
