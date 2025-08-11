"use client"
import { useEffect, useLayoutEffect, useRef, useState } from "react"
import { useWindowVirtualizer } from "@tanstack/react-virtual"
import PostCard from "@/components/PostCard"
import { createClient } from "@/utils/supabase/client"
import { useCommunity } from "@/app/context/CommunityContext"
import { PostsWithAuthorAndCommunity } from "@/complexTypes"
import PulseLogo from "@/components/PulseLogo"
import { useGeneralProfile } from "@/app/context/GeneralProfileContext"
import { upsertRecentlyVisitedCommunity } from "@/app/actions"

const PAGE_SIZE = 20

export default function VirtualScroller() {
    const supabase = createClient()
    const [items, setItems] = useState<PostsWithAuthorAndCommunity[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [hasMore, setHasMore] = useState(true)
    const { community } = useCommunity()
    const { user } = useGeneralProfile()
    // Reference to parent container
    const parentRef = useRef<HTMLDivElement>(null)

    // Store refs to all row elements for measurement
    const rowRefs = useRef<Record<number, HTMLDivElement>>({})

    // Function to estimate row height based on content
    const estimateSize = (index: number) => {
        const item = items[index]
        if (!item || !item.content) return 120

        const lineCount = Math.ceil(item.content.length / 80)
        return 100 + lineCount * 20
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

    useEffect(() => {
        const loadInitialItems = async () => {
            setIsLoading(true)
            try {
                const { data, error } = await supabase
                    .from('posts')
                    .select("*, users(username, avatar_url, verified), posts_votes(vote_type, voter_id, id), post_attachments(*), communities(community_name, verified, image_url), comments(count)")
                    .order("created_at", { ascending: false })
                    .range(0, PAGE_SIZE - 1)
                    .eq('community_id', community.id).eq('deleted', false)

                if (error) throw error
                setItems(data || [])
                setHasMore(data?.length === PAGE_SIZE)
            } catch (error) {
                console.error("Initial load error:", error)
            } finally {
                setIsLoading(false)
            }
        }

        loadInitialItems()

    }, [supabase, community.id])

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

        const from = items.length
        const to = from + PAGE_SIZE - 1

        const { data, error } = await supabase.from('posts').select("*, users(username, avatar_url, verified), posts_votes(vote_type, voter_id, id), post_attachments(*), communities(community_name, verified, image_url), comments(count)").order("created_at", { ascending: false })
            .range(from, to).eq('community_id', community.id).eq('deleted', false)

        if (error) {
            console.error("Error loading posts:", error.message)
        } else {
            if (data.length === 0) {
                setHasMore(false)
            } else {
                setItems((prev) => [...prev, ...data])
            }
        }

        setIsLoading(false)
    }

    useEffect(() => {
        if (!user) return;

        const debounceDelay = 3000;
        const timeoutId = setTimeout(async () => {
            const result = await upsertRecentlyVisitedCommunity(community.id, user.id);
            if (!result.success) {
                console.error(result.message);
            }
        }, debounceDelay);

        return () => clearTimeout(timeoutId);
    }, [community.id, user]);


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
            <div className="mx-auto">
                {!items[0] && !isLoading && !hasMore && <div className="flex items-center justify-center">
                    <h4 className="mt-20 border-b pb-2 w-fit scroll-m-20 text-xl font-semibold tracking-tight">
                        This community doesn&#39;t have any posts yet
                    </h4>
                </div>}
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
                                    <PostCard post={item} setItems={setItems} />
                                </div>
                            )
                        })}
                    </div>

                    {/* Loading indicator */}
                    {isLoading &&
                        <div className="flex justify-center py-8">
                            <PulseLogo />
                        </div>
                    }
                </div>
            </div>
        </div>
    )
}

