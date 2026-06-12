"use client";
import { useEffect, useState, useMemo, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import PulseLogo from "@/components/PulseLogo";
import { ChevronLeft, ChevronRight, Search, Users } from "lucide-react";
import { useGeneralProfile } from "@/app/context/GeneralProfileContext";
import { toast } from "sonner";
import { createCommunityMembership, removeCommunityMembership } from "@/app/actions";
import { topicCategories } from "@/components/topic-selector";

type Community = {
  id: string;
  community_name: string;
  description: string | null;
  image_url: string | null;
  created_at: string;
  topics: string[] | null;
  community_memberships: { count: number }[];
};

type SortOption = "popular" | "new";

export default function ExplorePage() {
  const { user } = useGeneralProfile();
  const supabase = createClient();
  const filterBarRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const updateScrollState = () => {
    const el = filterBarRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  };

  const scroll = (direction: "left" | "right") => {
    const el = filterBarRef.current;
    if (!el) return;
    el.scrollBy({ left: direction === "left" ? -240 : 240, behavior: "smooth" });
  };

  const [communities, setCommunities] = useState<Community[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortOption>("popular");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [joinedSet, setJoinedSet] = useState<Set<string>>(new Set());
  const [loadingJoin, setLoadingJoin] = useState<string | null>(null);

  useEffect(() => {
    const fetchCommunities = async () => {
      setIsLoading(true);
      const { data } = await supabase
        .from("communities")
        .select("id, community_name, description, image_url, created_at, topics, community_memberships(count)");
      setCommunities((data as Community[]) ?? []);
      setIsLoading(false);
    };
    fetchCommunities();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!user) return;
    const fetchJoined = async () => {
      const { data } = await supabase
        .from("community_memberships")
        .select("community_id")
        .eq("user_id", user.id);
      if (data) setJoinedSet(new Set(data.map((m) => m.community_id)));
    };
    fetchJoined();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const handleJoinToggle = async (community: Community) => {
    if (!user) { toast.error("Sign in to join communities"); return; }
    setLoadingJoin(community.id);
    const isJoined = joinedSet.has(community.id);
    const result = isJoined
      ? await removeCommunityMembership(user.id, community.id)
      : await createCommunityMembership(user.id, community.id);
    if (result?.success) {
      setJoinedSet((prev) => {
        const next = new Set(prev);
        isJoined ? next.delete(community.id) : next.add(community.id);
        return next;
      });
      setCommunities((prev) =>
        prev.map((c) =>
          c.id === community.id
            ? { ...c, community_memberships: [{ count: c.community_memberships[0].count + (isJoined ? -1 : 1) }] }
            : c
        )
      );
      toast.success(isJoined ? `Left s/${community.community_name}` : `Joined s/${community.community_name}!`);
    } else {
      toast.error("Something went wrong");
    }
    setLoadingJoin(null);
  };

  const sortFn = (a: Community, b: Community) =>
    sort === "popular"
      ? b.community_memberships[0].count - a.community_memberships[0].count
      : new Date(b.created_at).getTime() - new Date(a.created_at).getTime();

  const filteredAll = useMemo(() => {
    const q = search.toLowerCase();
    return communities
      .filter(
        (c) =>
          c.community_name.toLowerCase().includes(q) ||
          (c.description ?? "").toLowerCase().includes(q)
      )
      .sort(sortFn);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [communities, search, sort]);

  // When a category is active, show only matching communities flat
  const activeCategoryData = activeCategory
    ? topicCategories.find((tc) => tc.name === activeCategory)
    : null;

  const filteredByCategory = useMemo(() => {
    if (!activeCategoryData) return [];
    const topicIds = new Set(activeCategoryData.topics.map((t) => t.id));
    return filteredAll.filter((c) => c.topics?.some((t) => topicIds.has(t)));
  }, [filteredAll, activeCategoryData]);

  // Sections for "All" view — group by category
  const sections = useMemo(() => {
    if (activeCategory) return [];
    return topicCategories
      .map((cat) => {
        const topicIds = new Set(cat.topics.map((t) => t.id));
        const matched = filteredAll.filter((c) => c.topics?.some((t) => topicIds.has(t)));
        return { ...cat, communities: matched };
      })
      .filter((s) => s.communities.length > 0);
  }, [filteredAll, activeCategory]);

  // Communities with no topics at all
  const uncategorized = useMemo(() => {
    if (activeCategory) return [];
    const categorized = new Set(
      topicCategories.flatMap((cat) => {
        const topicIds = new Set(cat.topics.map((t) => t.id));
        return filteredAll.filter((c) => c.topics?.some((t) => topicIds.has(t))).map((c) => c.id);
      })
    );
    return filteredAll.filter((c) => !categorized.has(c.id));
  }, [filteredAll, activeCategory]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight mb-1">Explore Communities</h1>
        <p className="text-muted-foreground text-sm">Discover communities to join and engage with</p>
      </div>

      {/* Search + sort */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search communities..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2 shrink-0">
          <Button variant={sort === "popular" ? "default" : "outline"} size="sm" className="rounded-full" onClick={() => setSort("popular")}>Popular</Button>
          <Button variant={sort === "new" ? "default" : "outline"} size="sm" className="rounded-full" onClick={() => setSort("new")}>New</Button>
        </div>
      </div>

      {/* Horizontal category filter */}
      <div className="flex items-center gap-2 mb-6">
        <button
          onClick={() => scroll("left")}
          disabled={!canScrollLeft}
          className="shrink-0 h-8 w-8 flex items-center justify-center rounded-full border border-border bg-muted hover:bg-accent transition-colors disabled:opacity-30 disabled:pointer-events-none"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <div
          ref={filterBarRef}
          onScroll={updateScrollState}
          className="flex gap-2 overflow-x-auto scrollbar-hide"
        >
          <button
            onClick={() => setActiveCategory(null)}
            className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors border ${
              activeCategory === null
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-muted text-muted-foreground border-transparent hover:border-border"
            }`}
          >
            All
          </button>
          {topicCategories.map((cat) => (
            <button
              key={cat.name}
              onClick={() => setActiveCategory(activeCategory === cat.name ? null : cat.name)}
              className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors border whitespace-nowrap ${
                activeCategory === cat.name
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-muted text-muted-foreground border-transparent hover:border-border"
              }`}
            >
              {cat.emoji} {cat.name}
            </button>
          ))}
        </div>

        <button
          onClick={() => scroll("right")}
          disabled={!canScrollRight}
          className="shrink-0 h-8 w-8 flex items-center justify-center rounded-full border border-border bg-muted hover:bg-accent transition-colors disabled:opacity-30 disabled:pointer-events-none"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex justify-center py-20"><PulseLogo /></div>
      ) : activeCategory ? (
        // Single category view
        filteredByCategory.length === 0 ? (
          <div className="flex justify-center py-20">
            <p className="text-muted-foreground">No communities found in this category</p>
          </div>
        ) : (
          <CommunityGrid
            communities={filteredByCategory}
            joinedSet={joinedSet}
            loadingJoin={loadingJoin}
            onJoinToggle={handleJoinToggle}
          />
        )
      ) : (
        // All view — sections by topic
        <>
          {sections.map((section) => (
            <div key={section.name} className="mb-10">
              <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <span>{section.emoji}</span>
                {section.name}
              </h2>
              <CommunityGrid
                communities={section.communities}
                joinedSet={joinedSet}
                loadingJoin={loadingJoin}
                onJoinToggle={handleJoinToggle}
              />
            </div>
          ))}
          {uncategorized.length > 0 && (
            <div className="mb-10">
              <h2 className="text-lg font-semibold mb-3">Other</h2>
              <CommunityGrid
                communities={uncategorized}
                joinedSet={joinedSet}
                loadingJoin={loadingJoin}
                onJoinToggle={handleJoinToggle}
              />
            </div>
          )}
          {sections.length === 0 && uncategorized.length === 0 && (
            <div className="flex justify-center py-20">
              <p className="text-muted-foreground">No communities found</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function CommunityGrid({
  communities,
  joinedSet,
  loadingJoin,
  onJoinToggle,
}: {
  communities: Community[];
  joinedSet: Set<string>;
  loadingJoin: string | null;
  onJoinToggle: (c: Community) => void;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {communities.map((community) => {
        const memberCount = community.community_memberships[0]?.count ?? 0;
        const isJoined = joinedSet.has(community.id);
        const isSubmitting = loadingJoin === community.id;
        return (
          <div
            key={community.id}
            className="bg-saidit-black rounded-2xl p-4 flex flex-col gap-2 border border-border/40 hover:border-border transition-colors relative"
          >
            {/* Join button — top right */}
            <div className="absolute top-3 right-3">
              <Button
                size="sm"
                variant={isJoined ? "outline" : "default"}
                className="rounded-full h-7 px-3 text-xs"
                onClick={() => onJoinToggle(community)}
                disabled={isSubmitting}
              >
                {isSubmitting ? "..." : isJoined ? "Joined" : "Join"}
              </Button>
            </div>

            {/* Community info */}
            <div className="flex items-center gap-3 pr-16">
              <Link href={`/s/${community.community_name}`}>
                <Avatar className="h-10 w-10 shrink-0">
                  <AvatarImage src={community.image_url || undefined} className="rounded-full" draggable={false} />
                  <AvatarFallback>s/</AvatarFallback>
                </Avatar>
              </Link>
              <div className="min-w-0">
                <Link href={`/s/${community.community_name}`} className="font-semibold text-sm hover:underline truncate block">
                  s/{community.community_name}
                </Link>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Users className="h-3 w-3 shrink-0" />
                  <span>{memberCount.toLocaleString()} {memberCount === 1 ? "member" : "members"}</span>
                </div>
              </div>
            </div>

            {community.description && (
              <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                {community.description}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
