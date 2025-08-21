"use client"
import RecentlyVisitedPostsList from "@/components/RecentlyVisitedPostsList";
import { useGeneralProfile } from "./context/GeneralProfileContext";
import { createClient } from "@/utils/supabase/client";
import { useCallback, useState } from "react";
import { PostsWithAuthorAndCommunity } from "@/complexTypes";
import VirtualScroller from "@/components/VirtualScroller";
import PulseLogo from "@/components/PulseLogo";
import FeedPostCard from "@/components/FeedPostCard";
export default function Home() {
  const { profile } = useGeneralProfile()
  const supabase = createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [items, setItems] = useState<any[]>([])

  const fetchUserPosts = useCallback(async (from: number, to: number) => {
    if (!profile) return { data: [], error: null }

    return supabase
      .from('posts')
      .select("*, users(username,avatar_url, verified), posts_votes(vote_type, voter_id, id), post_attachments(*), communities(community_name, verified, image_url), comments(count)")
      .order("created_at", { ascending: false })
      .range(from, to)
      .eq('deleted', false)
  }, [profile, supabase])

  const estimatePostSize = (post: PostsWithAuthorAndCommunity | undefined) => {
    if (!post || !post.content) return 120
    const lineCount = Math.ceil(post.content.length / 80)
    return 100 + lineCount * 20
  }

  const renderPost = (post: PostsWithAuthorAndCommunity) => (
    <FeedPostCard post={post} setItems={setItems} />
  )

  const customEmptyState = (
    <div className="flex items-center justify-center">
      <h4 className="mt-20 border-b pb-2 w-fit scroll-m-20 text-xl font-semibold tracking-tight">
        No posts found
      </h4>
    </div>
  )

  return (
    <div className="grid grid-cols-3">
      <div className="mx-4 col-span-2">
        <VirtualScroller<PostsWithAuthorAndCommunity>
          queryFn={fetchUserPosts}
          renderItem={renderPost}
          estimateSize={estimatePostSize}
          emptyState={customEmptyState}
          loader={<div className="flex justify-center py-8"><PulseLogo /></div>}
          items={items}
          setItems={setItems}
        />
      </div>

      <div>
        {
          profile?.recently_visited_posts && profile?.recently_visited_posts.length > 0 &&
          <RecentlyVisitedPostsList />
        }
      </div>

    </div>
  )
}
