export default function SearchLoading() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-6 animate-pulse">
      {/* Query header */}
      <div className="h-4 w-48 bg-muted rounded mb-4" />

      {/* Tabs */}
      <div className="flex border-b gap-1 mb-3">
        {[80, 100, 70].map((w, i) => (
          <div key={i} className="px-5 py-3">
            <div className="h-3.5 bg-muted rounded" style={{ width: w }} />
          </div>
        ))}
      </div>

      {/* Filter pills */}
      <div className="flex items-center gap-2 mt-3 mb-4">
        <div className="h-3 w-14 bg-muted rounded" />
        {[72, 56, 48].map((w, i) => (
          <div key={i} className="h-7 bg-muted rounded-full" style={{ width: w }} />
        ))}
        <div className="h-7 w-28 bg-muted rounded-full" />
      </div>

      {/* Post skeletons */}
      <div className="flex flex-col gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="border rounded-lg p-4 bg-card">
            {/* Meta row */}
            <div className="flex items-center gap-2 mb-3">
              <div className="h-4 w-4 rounded-full bg-muted" />
              <div className="h-3 w-28 bg-muted rounded" />
              <div className="h-3 w-3 bg-muted rounded-full" />
              <div className="h-3 w-20 bg-muted rounded" />
            </div>
            {/* Title */}
            <div className="h-4 w-3/4 bg-muted rounded mb-2" />
            <div className="h-3 w-1/2 bg-muted rounded mb-4" />
            {/* Footer */}
            <div className="flex gap-4">
              <div className="h-3 w-16 bg-muted rounded" />
              <div className="h-3 w-20 bg-muted rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
