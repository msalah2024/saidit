"use client";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { useCallback, useState } from "react";
import { PostsWithAuthorAndCommunity } from "@/complexTypes";
import VirtualScroller from "@/components/VirtualScroller";
import FeedPostCard from "@/components/FeedPostCard";
import PulseLogo from "@/components/PulseLogo";
import SortAndViewBar from "@/components/SortAndViewBar";
import RecentlyVisitedPostsList from "@/components/RecentlyVisitedPostsList";
import { useGeneralProfile } from "@/app/context/GeneralProfileContext";

interface GlobalFeedProps {
  defaultSort: string;
  basePath: string;
}

export default function GlobalFeed({ defaultSort, basePath }: GlobalFeedProps) {
  const searchParams = useSearchParams();
  const currentSort = searchParams.get("sort") || defaultSort;
  const supabase = createClient();
  const { profile } = useGeneralProfile();
  const [items, setItems] = useState<PostsWithAuthorAndCommunity[]>([]);

  const fetchPosts = useCallback(
    async (from: number, to: number) => {
      const select =
        "*, users(username,avatar_url, verified), posts_votes(vote_type, voter_id, id), post_attachments(*), communities(community_name, verified, image_url), comments(count)";

      if (currentSort === "hot") {
        const result = await supabase.rpc("get_posts_hot", { from_offset: from, to_offset: to });
        return { data: result.data as PostsWithAuthorAndCommunity[] | null, error: result.error };
      }

      if (currentSort === "rising") {
        const result = await supabase.rpc("get_posts_rising", { from_offset: from, to_offset: to });
        return { data: result.data as PostsWithAuthorAndCommunity[] | null, error: result.error };
      }

      const query = supabase.from("posts").select(select).eq("deleted", false).range(from, to);

      if (currentSort === "top") {
        return query.order("net_votes", { ascending: false });
      }

      return query.order("created_at", { ascending: false });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentSort]
  );

  const estimatePostSize = (post: PostsWithAuthorAndCommunity | undefined) => {
    if (!post || !post.content) return 120;
    return 100 + Math.ceil(post.content.length / 80) * 20;
  };

  const renderPost = (post: PostsWithAuthorAndCommunity) => (
    <div className="flex justify-center">
      <FeedPostCard post={post} setItems={setItems} />
    </div>
  );

  return (
    <div className="grid grid-cols-3">
      <div className="px-4 col-span-3 lg:col-span-2">
        <SortAndViewBar currentSort={currentSort} basePath={basePath} />
        <VirtualScroller<PostsWithAuthorAndCommunity>
          queryFn={fetchPosts}
          renderItem={renderPost}
          estimateSize={estimatePostSize}
          emptyState={
            <div className="flex items-center justify-center">
              <h4 className="mt-20 border-b pb-2 w-fit scroll-m-20 text-xl font-semibold tracking-tight">
                No posts found
              </h4>
            </div>
          }
          loader={
            <div className="flex justify-center py-8">
              <PulseLogo />
            </div>
          }
          items={items}
          setItems={setItems}
        />
      </div>
      <div>
        {profile?.recently_visited_posts && profile.recently_visited_posts.length > 0 && (
          <RecentlyVisitedPostsList />
        )}
      </div>
    </div>
  );
}
