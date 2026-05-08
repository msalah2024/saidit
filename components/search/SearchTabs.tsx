"use client"
import { useRouter, useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import SearchResultsSkeleton from "./SearchResultsSkeleton"

interface SearchTabsProps {
  q: string
  type: string
  children: React.ReactNode
}

const TABS = [
  { label: "Posts", value: "posts" },
  { label: "Communities", value: "communities" },
  { label: "People", value: "people" },
]

export default function SearchTabs({ q, type, children }: SearchTabsProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState(type)

  useEffect(() => {
    setActiveTab(type)
    setIsLoading(false)
  }, [searchParams, type])

  const navigate = (tabValue: string) => {
    if (tabValue === activeTab) return
    setActiveTab(tabValue)
    setIsLoading(true)
    router.push(`/search?${new URLSearchParams({ q, type: tabValue }).toString()}`)
  }

  return (
    <>
      <div className="flex border-b">
        {TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => navigate(tab.value)}
            className={cn(
              "px-5 py-3 text-sm font-medium border-b-2 -mb-px transition-colors",
              activeTab === tab.value
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading ? <SearchResultsSkeleton /> : children}
    </>
  )
}
