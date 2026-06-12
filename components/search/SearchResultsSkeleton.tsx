export default function SearchResultsSkeleton() {
  return (
    <div className="flex flex-col gap-3 mt-4 animate-pulse">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="border rounded-lg p-4 bg-saidit-black">
          <div className="flex items-center gap-2 mb-3">
            <div className="h-4 w-4 rounded-full bg-muted" />
            <div className="h-3 w-28 bg-muted rounded" />
            <div className="h-3 w-3 bg-muted rounded-full" />
            <div className="h-3 w-20 bg-muted rounded" />
          </div>
          <div className="h-4 bg-muted rounded mb-2" style={{ width: `${55 + (i % 3) * 10}%` }} />
          <div className="h-3 bg-muted rounded mb-4" style={{ width: `${35 + (i % 3) * 8}%` }} />
          <div className="flex gap-4">
            <div className="h-3 w-16 bg-muted rounded" />
            <div className="h-3 w-20 bg-muted rounded" />
          </div>
        </div>
      ))}
    </div>
  )
}
