"use client";
import RecentlyVisitedPostsList from "@/components/RecentlyVisitedPostsList";
import { useGeneralProfile } from "@/app/context/GeneralProfileContext";
import { createClient } from "@/utils/supabase/client";
import { useCallback, useState } from "react";
import { PostsWithAuthorAndCommunity } from "@/complexTypes";
import VirtualScroller from "@/components/VirtualScroller";
import PulseLogo from "@/components/PulseLogo";
import FeedPostCard from "@/components/FeedPostCard";
import SortAndViewBar from "@/components/SortAndViewBar";
import NavbarSearchBar from "@/components/NavbarSearchBar";

interface HomeFeedProps {
  sort: string;
}

export default function HomeFeed({ sort: currentSort }: HomeFeedProps) {
  const { profile } = useGeneralProfile();
  const supabase = createClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [items, setItems] = useState<any[]>([]);

  const fetchUserPosts = useCallback(
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

      const query = supabase
        .from("posts")
        .select(select)
        .eq("deleted", false)
        .range(from, to);

      if (currentSort === "top") {
        return query.order("net_votes", { ascending: false });
      }

      return query.order("created_at", { ascending: false });
    },
    [supabase, currentSort]
  );

  const estimatePostSize = (post: PostsWithAuthorAndCommunity | undefined) => {
    if (!post || !post.content) return 120;
    const lineCount = Math.ceil(post.content.length / 80);
    return 100 + lineCount * 20;
  };

  const renderPost = (post: PostsWithAuthorAndCommunity) => (
    <div className="flex justify-center">
      <FeedPostCard post={post} setItems={setItems} />
    </div>
  );

  const customEmptyState = (
    <div className="flex items-center justify-center">
      <h4 className="mt-20 border-b pb-2 w-fit scroll-m-20 text-xl font-semibold tracking-tight">
        No posts found
      </h4>
    </div>
  );

  return (
    <div className="grid grid-cols-3">
      <div className="px-4 col-span-3 lg:col-span-2">
        <div className="sm:hidden mt-4">
          <NavbarSearchBar />
        </div>
        <SortAndViewBar currentSort={currentSort} />
        <VirtualScroller<PostsWithAuthorAndCommunity>
          queryFn={fetchUserPosts}
          renderItem={renderPost}
          estimateSize={estimatePostSize}
          emptyState={customEmptyState}
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
        {profile?.recently_visited_posts &&
          profile?.recently_visited_posts.length > 0 && (
            <RecentlyVisitedPostsList />
          )}
      </div>
    </div>
  );
}
