"use client"

import { useEffect, useLayoutEffect, useRef, useState } from "react"
import { useWindowVirtualizer } from "@tanstack/react-virtual"
import { faker } from "@faker-js/faker"

// Generate a random item with variable content length and random images
const generateItem = (index: number) => {
    // Randomly decide if this post should have images (about 60% chance)
    const hasImages = Math.random() < 0.6

    // Generate 0-3 images if hasImages is true
    const images = hasImages
        ? Array.from({ length: Math.floor(Math.random() * 3) + 1 }).map(() => ({
            url: faker.image.url({
                width: 640,
                height: 480,
                category: faker.helpers.arrayElement([
                    "nature",
                    "city",
                    "business",
                    "food",
                    "nightlife",
                    "fashion",
                    "people",
                    "transport",
                ]),
            }),
            alt: faker.lorem.words(3),
        }))
        : []

    return {
        id: index,
        name: faker.person.fullName(),
        email: faker.internet.email(),
        avatar: faker.image.avatar(),
        bio: faker.lorem.paragraphs(Math.floor(Math.random() * 3) + 1),
        color: faker.color.rgb(),
        company: faker.company.name(),
        jobTitle: faker.person.jobTitle(),
        images,
        timestamp: faker.date.recent({ days: 14 }).toISOString(),
    }
}

// Generate initial batch of items
const generateItems = (count: number, startIndex = 0) => {
    return Array.from({ length: count }).map((_, i) => generateItem(i + startIndex))
}

// Format date for display
const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
    }).format(date)
}

export default function VirtualScroller() {
    const [items, setItems] = useState(() => generateItems(100))
    const [isLoading, setIsLoading] = useState(false)
    const [hasMore, setHasMore] = useState(true)

    // Reference to parent container
    const parentRef = useRef<HTMLDivElement>(null)

    // Store refs to all row elements for measurement
    const rowRefs = useRef<Record<number, HTMLDivElement>>({})

    // Function to estimate row height based on content
    const estimateSize = (index: number) => {
        const item = items[index]
        if (!item) return 120

        // Estimate based on bio length and number of images
        const bioLines = Math.ceil(item.bio.length / 80) // ~80 chars per line
        const baseHeight = 80 // Base height for name, email, etc.
        const bioHeight = bioLines * 20 // ~20px per line

        // Add height for images if present
        const imageHeight = item.images.length > 0 ? 220 : 0 // Approximate height for image section

        return Math.max(120, baseHeight + bioHeight + imageHeight)
    }

    // Set up the virtualizer with better configuration
    const virtualizer = useWindowVirtualizer({
        count: items.length,
        estimateSize,
        // scrollMargin: parentRef.current?.offsetTop || 0,
        scrollMargin: 16,
        overscan: 5,
        measureElement: (el) => {
            // Use the actual element height
            return el?.getBoundingClientRect().height ?? estimateSize(0)
        },
    })

    // Handle loading more items when scrolling near the bottom
    useEffect(() => {
        const handleScroll = () => {
            if (!hasMore || isLoading) return

            const scrollTop = window.scrollY
            const windowHeight = window.innerHeight
            const documentHeight = document.documentElement.scrollHeight

            // Load more when user scrolls to 80% of the way down
            if (scrollTop + windowHeight >= documentHeight * 0.8) {
                loadMoreItems()
            }
        }

        window.addEventListener("scroll", handleScroll, { passive: true })
        return () => window.removeEventListener("scroll", handleScroll)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [items, isLoading, hasMore])

    // Function to load more items
    const loadMoreItems = async () => {
        if (isLoading || !hasMore) return

        setIsLoading(true)

        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 500))

        // Add more items
        const newItems = generateItems(50, items.length)
        setItems((prevItems) => [...prevItems, ...newItems])

        // Stop infinite loading after reaching 500 items (for demo purposes)
        if (items.length + 50 >= 500) {
            setHasMore(false)
        }

        setIsLoading(false)
    }

    // Measure elements after they're rendered
    useLayoutEffect(() => {
        virtualizer.getVirtualItems().forEach((virtualItem) => {
            const element = rowRefs.current[virtualItem.index]
            if (element) {
                virtualizer.measureElement(element)
            }
        })
    })

    return (
        <div className="min-h-screen border-t">
            <div className="mx-auto max-w-4xl">
                <div ref={parentRef} className="relative">
                    {/* Virtual list container */}
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
                                        if (el) {
                                            rowRefs.current[virtualItem.index] = el
                                        }
                                    }}
                                    style={{
                                        position: "absolute",
                                        top: 0,
                                        left: 0,
                                        width: "100%",
                                        transform: `translateY(${virtualItem.start}px)`,
                                    }}
                                >
                                    <div className="mx-2 mb-4">
                                        <div
                                            className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
                                            style={{ borderLeft: `4px solid ${item.color}` }}
                                        >
                                            <div className="flex gap-4">
                                                <div className="flex-shrink-0">
                                                    <img
                                                        src={item.avatar || "/placeholder.svg"}
                                                        alt={item.name}
                                                        className="h-16 w-16 rounded-full object-cover ring-2 ring-gray-100"
                                                        crossOrigin="anonymous"
                                                    />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-start justify-between">
                                                        <div>
                                                            <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
                                                            <p className="text-sm text-gray-600">{item.jobTitle}</p>
                                                            <p className="text-sm text-gray-500">{item.company}</p>
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="mt-1 text-xs text-gray-400">{formatDate(item.timestamp)}</div>
                                                        </div>
                                                    </div>
                                                    <div className="mt-4">
                                                        <p className="text-sm leading-relaxed text-gray-700">{item.bio}</p>
                                                    </div>

                                                    {/* Image gallery - only shown if the post has images */}
                                                    {item.images.length > 0 && (
                                                        <div className="mt-4">
                                                            <div
                                                                className={`grid gap-2 ${item.images.length === 1
                                                                    ? "grid-cols-1"
                                                                    : item.images.length === 2
                                                                        ? "grid-cols-2"
                                                                        : "grid-cols-3"
                                                                    }`}
                                                            >
                                                                {item.images.map((image, idx) => (
                                                                    <div
                                                                        key={idx}
                                                                        className="relative aspect-[4/3] overflow-hidden rounded-lg bg-gray-100"
                                                                    >
                                                                        <img
                                                                            src={image.url || "/placeholder.svg"}
                                                                            alt={image.alt}
                                                                            className="h-full w-full object-cover transition-transform hover:scale-105"
                                                                            crossOrigin="anonymous"
                                                                            loading="lazy"
                                                                        />
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                    {/* Loading indicator */}
                    {isLoading && (
                        <div className="flex justify-center py-8">
                            <div className="flex items-center gap-3 rounded-full bg-white px-6 py-3 shadow-sm">
                                <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"></div>
                                <span className="text-sm font-medium text-gray-600">Loading more...</span>
                            </div>
                        </div>
                    )}

                    {/* End of list message */}
                    {!hasMore && !isLoading && items.length > 0 && (
                        <div className="py-8 text-center">
                            <div className="rounded-lg bg-white p-6 shadow-sm">
                                <p className="text-gray-500">🎉 You've reached the end!</p>
                                <p className="mt-1 text-sm text-gray-400">Loaded {items.length} items total</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

