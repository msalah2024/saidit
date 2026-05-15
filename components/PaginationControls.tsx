"use client"
import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface PaginationControlsProps {
  page: number
  totalPages: number
}

export default function PaginationControls({ page, totalPages }: PaginationControlsProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const buildUrl = (p: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("page", String(p))
    return `${pathname}?${params.toString()}`
  }

  if (totalPages <= 1) return null

  const pageNumbers: number[] = []
  const delta = 2
  const start = Math.max(1, page - delta)
  const end = Math.min(totalPages, page + delta)
  for (let i = start; i <= end; i++) pageNumbers.push(i)

  return (
    <div className="flex items-center justify-center gap-1 mt-8">
      <Link
        href={buildUrl(page - 1)}
        aria-disabled={page === 1}
        className={cn(
          "flex items-center justify-center w-8 h-8 rounded-full text-sm transition-colors",
          page === 1
            ? "pointer-events-none text-muted-foreground opacity-40"
            : "hover:bg-muted text-foreground"
        )}
      >
        <ChevronLeft className="h-4 w-4" />
      </Link>

      {start > 1 && (
        <>
          <Link href={buildUrl(1)} className="flex items-center justify-center w-8 h-8 rounded-full text-sm hover:bg-muted transition-colors">1</Link>
          {start > 2 && <span className="text-muted-foreground px-1">…</span>}
        </>
      )}

      {pageNumbers.map((p) => (
        <Link
          key={p}
          href={buildUrl(p)}
          className={cn(
            "flex items-center justify-center w-8 h-8 rounded-full text-sm transition-colors",
            p === page
              ? "bg-primary text-primary-foreground font-semibold pointer-events-none"
              : "hover:bg-muted text-foreground"
          )}
        >
          {p}
        </Link>
      ))}

      {end < totalPages && (
        <>
          {end < totalPages - 1 && <span className="text-muted-foreground px-1">…</span>}
          <Link href={buildUrl(totalPages)} className="flex items-center justify-center w-8 h-8 rounded-full text-sm hover:bg-muted transition-colors">{totalPages}</Link>
        </>
      )}

      <Link
        href={buildUrl(page + 1)}
        aria-disabled={page === totalPages}
        className={cn(
          "flex items-center justify-center w-8 h-8 rounded-full text-sm transition-colors",
          page === totalPages
            ? "pointer-events-none text-muted-foreground opacity-40"
            : "hover:bg-muted text-foreground"
        )}
      >
        <ChevronRight className="h-4 w-4" />
      </Link>
    </div>
  )
}
