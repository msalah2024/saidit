"use client"
import { useRouter, useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { ChevronDown } from "lucide-react"
import SearchResultsSkeleton from "./SearchResultsSkeleton"

interface SearchFiltersProps {
  q: string
  sort: string
  t: string
  community?: string
  children: React.ReactNode
}

const SORT_OPTIONS = [
  { label: "Relevance", value: "relevance" },
  { label: "New", value: "new" },
  { label: "Top", value: "top" },
]

const TIME_OPTIONS = [
  { label: "All time", value: "all" },
  { label: "Past year", value: "year" },
  { label: "Past month", value: "month" },
  { label: "Past week", value: "week" },
  { label: "Past 24 hours", value: "day" },
]

export default function SearchFilters({ q, sort, t, community, children }: SearchFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [activeSort, setActiveSort] = useState(sort)
  const [activeT, setActiveT] = useState(t)

  useEffect(() => {
    setActiveSort(sort)
    setActiveT(t)
    setIsLoading(false)
  }, [searchParams, sort, t])

  const navigate = (updates: Record<string, string>) => {
    const newSort = updates.sort ?? activeSort
    const newT = updates.t ?? activeT
    setActiveSort(newSort)
    setActiveT(newT)
    setIsLoading(true)
    const params: Record<string, string> = { q, type: "posts", sort: newSort, t: newT }
    if (community) params.community = community
    router.push(`/search?${new URLSearchParams(params).toString()}`)
  }

  const currentTime = TIME_OPTIONS.find((o) => o.value === activeT) ?? TIME_OPTIONS[0]

  return (
    <>
      <div className="flex items-center gap-3 mt-3 flex-wrap">
        <div className="flex items-center gap-1">
          <span className="text-xs text-muted-foreground mr-1">Sort by:</span>
          {SORT_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => navigate({ sort: option.value })}
              disabled={isLoading}
              className={cn(
                "px-3 py-1 rounded-full text-sm font-medium transition-colors",
                activeSort === option.value
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted"
              )}
            >
              {option.label}
            </button>
          ))}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              disabled={isLoading}
              className="rounded-full h-7 gap-1 text-xs"
            >
              {currentTime.label}
              <ChevronDown className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {TIME_OPTIONS.map((option) => (
              <DropdownMenuItem
                key={option.value}
                onClick={() => navigate({ t: option.value })}
                className={cn(activeT === option.value && "font-semibold")}
              >
                {option.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {isLoading ? <SearchResultsSkeleton /> : children}
    </>
  )
}
