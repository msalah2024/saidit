"use client"

import { useEffect, useLayoutEffect, useRef, useState, useCallback, SetStateAction } from "react"
import { useWindowVirtualizer } from "@tanstack/react-virtual"
import PulseLogo from "@/components/PulseLogo"

const PAGE_SIZE = 20
const OVERSCAN_COUNT = 5

// Define the props for our reusable component
interface VirtualScrollerProps<T> {
  // A function that fetches a page of data.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  queryFn: (from: number, to: number) => Promise<{ data: T[] | null; error: any }>

  // A function that takes a single item of type T and returns JSX to render it.
  renderItem: (item: T) => React.ReactNode

  // A function to estimate the size of a row for virtualization.
  estimateSize: (item: T | undefined) => number

  // Optional JSX to display when the list is empty.
  emptyState?: React.ReactNode

  // Optional JSX for the loading indicator.
  loader?: React.ReactNode

  // Use the generic type T for improved type safety.
  items: T[]
  setItems: React.Dispatch<SetStateAction<T[]>>
}

// Use a generic <T> to make the component type-safe for any data structure.
export default function VirtualScroller<T>({
  queryFn,
  renderItem,
  estimateSize,
  emptyState = <p>No items found.</p>,
  loader = <div className="flex justify-center py-8"><PulseLogo /></div>,
  items,
  setItems
}: VirtualScrollerProps<T>) {
  const [isLoading, setIsLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)

  const parentRef = useRef<HTMLDivElement>(null)
  const rowRefs = useRef<Record<number, HTMLDivElement>>({})

  const virtualizer = useWindowVirtualizer({
    count: items.length,
    estimateSize: (index) => estimateSize(items[index]),
    scrollMargin: 16,
    overscan: OVERSCAN_COUNT,
    measureElement: (el) => {
      return el?.getBoundingClientRect().height ?? estimateSize(undefined)
    },
  })

  const loadMoreItems = useCallback(async () => {
    if (isLoading || !hasMore) return
    setIsLoading(true)

    const from = items.length
    const to = from + PAGE_SIZE - 1

    try {
      const { data, error } = await queryFn(from, to)
      if (error) throw error

      if (data && data.length > 0) {
        setItems((prev) => [...prev, ...data])
      } else {
        setHasMore(false)
      }
    } catch (error) {
      console.error("Error loading more items:", error)
    } finally {
      setIsLoading(false)
    }
  }, [isLoading, hasMore, items.length, queryFn, setItems])

  // Effect for initial data load
  useEffect(() => {
    const loadInitial = async () => {
      setIsLoading(true)
      try {
        const { data, error } = await queryFn(0, PAGE_SIZE - 1)
        if (error) throw error
        setItems(data || [])
        setHasMore(data?.length === PAGE_SIZE)
      } catch (error) {
        console.error("Initial load error:", error)
      } finally {
        setIsLoading(false)
      }
    }
    loadInitial()
    // Disable exhaustive-deps rule for initial load: we only want this to run once on mount,
    // or when queryFn changes (e.g., user profile changes), not when setItems changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryFn])

  // **IMPROVEMENT 1: Replaced manual scroll listener with TanStack's recommended pattern.**
  // Effect to handle infinite scrolling by checking virtual item index.
  useEffect(() => {
    const virtualItems = virtualizer.getVirtualItems()

    if (virtualItems.length === 0) return

    const lastItem = virtualItems[virtualItems.length - 1]

    // Fetch more when the user scrolls near the end of the loaded item list.
    if (lastItem.index >= items.length - OVERSCAN_COUNT && hasMore && !isLoading) {
      loadMoreItems()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [virtualizer.getVirtualItems(), items.length, hasMore, isLoading, loadMoreItems])

  // **IMPROVEMENT 2: Added dependency array to useLayoutEffect.**
  // Effect to measure elements for dynamic height. Adding the dependency array
  // ensures this runs only when virtual items change, not on every render.
  useLayoutEffect(() => {
    virtualizer.getVirtualItems().forEach((virtualItem) => {
      const element = rowRefs.current[virtualItem.index]
      if (element) {
        virtualizer.measureElement(element)
      }
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [virtualizer, virtualizer.getVirtualItems()])

  return (
    <div className="min-h-screen border-t">
      <div className="mx-auto">
        {!items.length && !isLoading && !hasMore && emptyState}
        <div ref={parentRef} className="relative">
          <div
            style={{
              height: `${virtualizer.getTotalSize()}px`,
              width: "100%",
              position: "relative",
            }}
          >
            {virtualizer.getVirtualItems().map((virtualItem) => {
              const item = items[virtualItem.index]
              if (!item) return null

              return (
                <div
                  key={virtualItem.key}
                  data-index={virtualItem.index}
                  ref={(el) => {
                    if (el) rowRefs.current[virtualItem.index] = el
                  }}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    transform: `translateY(${virtualItem.start}px)`,
                  }}
                >
                  {renderItem(item)}
                </div>
              )
            })}
          </div>
          {isLoading && loader}
        </div>
      </div>
    </div>
  )
}