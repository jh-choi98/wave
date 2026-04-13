export default function Loading() {
  return (
    <div className="flex h-[100dvh] animate-pulse flex-col pb-16">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div className="h-5 w-32 rounded bg-muted" />
        <div className="h-8 w-8 rounded-full bg-muted" />
      </div>
      <div className="flex-1 space-y-3 px-4 py-4">
        <div className="h-4 w-3/4 rounded bg-muted" />
        <div className="h-4 w-full rounded bg-muted" />
        <div className="h-4 w-5/6 rounded bg-muted" />
        <div className="h-4 w-2/3 rounded bg-muted" />
        <div className="h-4 w-full rounded bg-muted" />
      </div>
      <div className="border-t px-4 py-3">
        <div className="h-24 w-full rounded bg-muted" />
        <div className="mt-2 flex justify-end">
          <div className="h-8 w-16 rounded bg-muted" />
        </div>
      </div>
    </div>
  )
}
