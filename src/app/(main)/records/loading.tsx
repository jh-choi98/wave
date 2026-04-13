export default function Loading() {
  return (
    <div className="animate-pulse space-y-3 px-4 py-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-lg border p-3">
          <div className="mb-2 h-4 w-24 rounded bg-muted" />
          <div className="mb-1 h-3 w-3/4 rounded bg-muted" />
          <div className="h-3 w-1/2 rounded bg-muted" />
        </div>
      ))}
    </div>
  )
}
