"use client"
import { useEffect, useLayoutEffect, useRef, useState } from "react"
import { useWindowVirtualizer } from "@tanstack/react-virtual"
import { createClient } from "@/utils/supabase/client"
import { PostsWithAuthorAndCommunity } from "@/complexTypes"
import PulseLogo from "@/components/PulseLogo"
import { useProfile } from "@/app/context/ProfileContext"
import FeedPostCard from "@/components/FeedPostCard"

const PAGE_SIZE = 20

interface ProfileVotedTabProps {
  type: "upvote" | "downvote"
}

export default function ProfileVotedTab({ type }: ProfileVotedTabProps) {
  const supabase = createClient()
  const { profile } = useProfile()
  const [items, setItems] = useState<PostsWithAuthorAndCommunity[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const parentRef = useRef<HTMLDivElement>(null)
  const rowRefs = useRef<Record<number, HTMLDivElement>>({})

  const estimateSize = (index: number) => {
    const item = items[index]
    if (!item || !item.content) return 120
    return 100 + Math.ceil(item.content.length / 80) * 20
  }

  const virtualizer = useWindowVirtualizer({
    count: items.length,
    estimateSize,
    scrollMargin: 16,
    overscan: 5,
    measureElement: (el) => el?.getBoundingClientRect().height ?? estimateSize(0),
  })

  const fetchItems = async (from: number) => {
    const to = from + PAGE_SIZE - 1

    const { data, error } = await supabase
      .from('posts_votes')
      .select(`
        created_at,
        posts!inner(
          *,
          users(username, avatar_url, verified),
          posts_votes(vote_type, voter_id, id),
          post_attachments(*),
          communities(community_name, verified, image_url),
          comments(count)
        )
      `)
      .eq('voter_id', profile.account_id)
      .eq('vote_type', type)
      .order('created_at', { ascending: false })
      .range(from, to)

    if (error) { console.error(error); return [] }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (data ?? []).map((v: any) => v.posts).filter((p: any) => p && !p.deleted) as PostsWithAuthorAndCommunity[]
  }

  useEffect(() => {
    const load = async () => {
      setIsLoading(true)
      setItems([])
      setHasMore(true)
      const data = await fetchItems(0)
      setItems(data)
      setHasMore(data.length === PAGE_SIZE)
      setIsLoading(false)
    }
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, profile.account_id])

  useEffect(() => {
    const handleScroll = () => {
      if (!hasMore || isLoading) return
      const scrollTop = window.scrollY
      const windowHeight = window.innerHeight
      const documentHeight = document.documentElement.scrollHeight
      if (scrollTop + windowHeight >= documentHeight * 0.8) loadMore()
    }
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, isLoading, hasMore])

  const loadMore = async () => {
    if (isLoading || !hasMore) return
    setIsLoading(true)
    const data = await fetchItems(items.length)
    if (data.length === 0) {
      setHasMore(false)
    } else {
      setItems((prev) => [...prev, ...data])
    }
    setIsLoading(false)
  }

  useLayoutEffect(() => {
    virtualizer.getVirtualItems().forEach((virtualItem) => {
      const element = rowRefs.current[virtualItem.index]
      if (element) virtualizer.measureElement(element)
    })
  })

  const label = type === "upvote" ? "upvoted" : "downvoted"

  return (
    <div className="min-h-screen border-t">
      <div className="mx-auto">
        {!isLoading && items.length === 0 && (
          <div className="flex items-center justify-center">
            <h4 className="mt-20 border-b pb-2 w-fit scroll-m-20 text-xl font-semibold tracking-tight">
              No {label} posts
            </h4>
          </div>
        )}
        <div ref={parentRef} className="relative">
          <div style={{ height: `${virtualizer.getTotalSize()}px`, width: "100%", position: "relative" }}>
            {virtualizer.getVirtualItems().map((virtualItem) => {
              const item = items[virtualItem.index]
              if (!item) return null
              return (
                <div
                  key={virtualItem.key}
                  data-index={virtualItem.index}
                  ref={(el) => { if (el) rowRefs.current[virtualItem.index] = el }}
                  style={{ position: "absolute", top: 0, left: 0, width: "100%", transform: `translateY(${virtualItem.start}px)` }}
                >
                  <FeedPostCard post={item} setItems={setItems} />
                </div>
              )
            })}
          </div>
          {isLoading && <div className="flex justify-center py-8"><PulseLogo /></div>}
        </div>
      </div>
    </div>
  )
}
