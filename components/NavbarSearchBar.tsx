"use client"
import { useRouter, useSearchParams } from "next/navigation"
import { useState, useEffect, useRef, Suspense, useCallback } from "react"
import Link from "next/link"
import { Search, Clock, X, TrendingUp } from "lucide-react"
import Logo from "@/public/assets/images/saidit-logo.svg"
import {
  searchCommunities,
  searchUsers,
  getTrendingCommunities,
  getTrendingPosts,
  getRecentSearches,
  saveRecentSearch as saveRecentSearchAction,
  deleteRecentSearch as deleteRecentSearchAction,
  clearAllRecentSearches,
} from "@/app/actions"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { formatCompactNumber } from "@/lib/formatNumbers"

type CommunitySuggestion = {
  id: string
  community_name: string
  image_url: string | null
  community_memberships: { count: number }[]
}

type UserSuggestion = {
  account_id: string
  username: string
  avatar_url: string | null
  post_karma: number
  comment_karma: number
}

type TrendingPost = {
  id: string
  title: string
  slug: string
  communities: {
    community_name: string
    image_url: string | null
  }
}

type Suggestions = {
  communities: CommunitySuggestion[]
  users: UserSuggestion[]
}

const RECENT_KEY = "recent_searches"
const MAX_RECENT = 5

function SearchInput() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [value, setValue] = useState(searchParams.get("q") ?? "")
  const [suggestions, setSuggestions] = useState<Suggestions>({ communities: [], users: [] })
  const [showDropdown, setShowDropdown] = useState(false)
  const [focusedIndex, setFocusedIndex] = useState(-1)
  const [isFetching, setIsFetching] = useState(false)
  const [isPending, setIsPending] = useState(false)

  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [trendingCommunities, setTrendingCommunities] = useState<CommunitySuggestion[]>([])
  const [trendingPosts, setTrendingPosts] = useState<TrendingPost[]>([])
  const [isFetchingTrending, setIsFetchingTrending] = useState(false)
  const isAuthenticatedRef = useRef<boolean | null>(null)

  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const hasFetchedTrending = useRef(false)
  const isUserTypingRef = useRef(false)

  useEffect(() => {
    const q = searchParams.get("q")
    if (q === null) return
    isUserTypingRef.current = false
    setValue(q)
  }, [searchParams])

  useEffect(() => {
    getRecentSearches().then((result) => {
      isAuthenticatedRef.current = result.authenticated
      if (result.authenticated && result.data) {
        setRecentSearches(result.data)
      } else {
        // unauthenticated — fall back to localStorage
        try {
          const stored = localStorage.getItem(RECENT_KEY)
          if (stored) setRecentSearches(JSON.parse(stored))
        } catch {}
      }
    })
  }, [])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
        setFocusedIndex(-1)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  // Block scroll without touching overflow (avoids layout shift from scrollbar disappearing)
  useEffect(() => {
    if (!showDropdown) return
    const prevent = (e: Event) => e.preventDefault()
    document.addEventListener("wheel", prevent, { passive: false })
    document.addEventListener("touchmove", prevent, { passive: false })
    return () => {
      document.removeEventListener("wheel", prevent)
      document.removeEventListener("touchmove", prevent)
    }
  }, [showDropdown])

  const fetchSuggestions = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSuggestions({ communities: [], users: [] })
      setShowDropdown(false)
      setIsPending(false)
      return
    }
    setIsFetching(true)
    const [commResult, usersResult] = await Promise.all([
      searchCommunities(query),
      searchUsers(query),
    ])
    setSuggestions({
      communities: (commResult.data as CommunitySuggestion[] ?? []).slice(0, 4),
      users: (usersResult.data as UserSuggestion[] ?? []).slice(0, 3),
    })
    setShowDropdown(true)
    setIsFetching(false)
    setIsPending(false)
  }, [])

  useEffect(() => {
    if (!value.trim()) {
      setIsPending(false)
      setSuggestions({ communities: [], users: [] })
      return
    }
    if (!isUserTypingRef.current) return
    setIsPending(true)
    setShowDropdown(true)
    const timer = setTimeout(() => fetchSuggestions(value), 300)
    return () => clearTimeout(timer)
  }, [value, fetchSuggestions])

  const fetchTrendingData = useCallback(async () => {
    if (hasFetchedTrending.current) return
    hasFetchedTrending.current = true
    setIsFetchingTrending(true)
    const [commResult, postsResult] = await Promise.all([
      getTrendingCommunities(),
      getTrendingPosts(),
    ])
    setTrendingCommunities((commResult.data as CommunitySuggestion[] ?? []).slice(0, 5))
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setTrendingPosts((postsResult.data as any[] ?? []).slice(0, 5))
    setIsFetchingTrending(false)
  }, [])

  const saveRecentSearch = useCallback((query: string) => {
    const trimmed = query.trim()
    if (!trimmed) return
    // Optimistic update
    setRecentSearches((prev) => {
      const filtered = prev.filter((s) => s !== trimmed)
      return [trimmed, ...filtered].slice(0, MAX_RECENT)
    })
    if (isAuthenticatedRef.current) {
      saveRecentSearchAction(trimmed)
    } else {
      setRecentSearches((prev) => {
        localStorage.setItem(RECENT_KEY, JSON.stringify(prev))
        return prev
      })
    }
  }, [])

  const removeRecentSearch = (query: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setRecentSearches((prev) => {
      const updated = prev.filter((s) => s !== query)
      if (!isAuthenticatedRef.current) localStorage.setItem(RECENT_KEY, JSON.stringify(updated))
      return updated
    })
    if (isAuthenticatedRef.current) deleteRecentSearchAction(query)
  }

  const clearRecentSearches = (e: React.MouseEvent) => {
    e.stopPropagation()
    setRecentSearches([])
    if (isAuthenticatedRef.current) {
      clearAllRecentSearches()
    } else {
      localStorage.removeItem(RECENT_KEY)
    }
  }

  const navigate = useCallback(
    (url: string, searchQuery?: string) => {
      setShowDropdown(false)
      setFocusedIndex(-1)
      if (searchQuery) saveRecentSearch(searchQuery)
      router.push(url)
    },
    [router, saveRecentSearch]
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = value.trim()
    if (!trimmed) return
    navigate(`/search?q=${encodeURIComponent(trimmed)}&type=posts`, trimmed)
  }

  const handleFocus = () => {
    if (!value.trim()) {
      setShowDropdown(true)
      fetchTrendingData()
    }
  }

  // ── discovery items for keyboard nav ──────────────────────────────────────
  const isDiscovery = showDropdown && !value.trim()

  const allDiscoveryItems = [
    ...recentSearches.map((s) => ({ type: "recent" as const, data: s })),
    ...trendingCommunities.map((c) => ({ type: "community" as const, data: c })),
    ...trendingPosts.map((p) => ({ type: "trending_post" as const, data: p })),
  ]

  // ── suggestion items for keyboard nav ─────────────────────────────────────
  const allSuggestionItems = [
    ...suggestions.communities.map((c) => ({ type: "community" as const, data: c })),
    ...suggestions.users.map((u) => ({ type: "user" as const, data: u })),
    { type: "search" as const, data: null },
  ]

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown) return
    const items = isDiscovery ? allDiscoveryItems : allSuggestionItems
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setFocusedIndex((i) => Math.min(i + 1, items.length - 1))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setFocusedIndex((i) => Math.max(i - 1, -1))
    } else if (e.key === "Enter" && focusedIndex >= 0) {
      e.preventDefault()
      const item = items[focusedIndex]
      if (item.type === "recent") {
        const q = item.data as string
        navigate(`/search?q=${encodeURIComponent(q)}&type=posts`, q)
      } else if (item.type === "community") {
        navigate(`/s/${(item.data as CommunitySuggestion).community_name}`)
      } else if (item.type === "trending_post") {
        const p = item.data as TrendingPost
        navigate(`/s/${p.communities.community_name}/comments/${p.slug}`)
      } else if (item.type === "user") {
        navigate(`/u/${(item.data as UserSuggestion).username}`)
      } else {
        const trimmed = value.trim()
        if (trimmed) navigate(`/search?q=${encodeURIComponent(trimmed)}&type=posts`, trimmed)
      }
    } else if (e.key === "Escape") {
      setShowDropdown(false)
      setFocusedIndex(-1)
      inputRef.current?.blur()
    }
  }

  const hasSuggestions = suggestions.communities.length > 0 || suggestions.users.length > 0
  const hasDiscoveryContent =
    recentSearches.length > 0 || trendingCommunities.length > 0 || trendingPosts.length > 0

  // per-render counters for focused index tracking
  let dIdx = -1
  let sIdx = -1

  return (
    <div ref={containerRef} className="w-full max-w-xl relative">
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={Logo.src} alt="Saidit" className="h-4 w-auto" />
          </div>
          <input
            ref={inputRef}
            value={value}
            onChange={(e) => { isUserTypingRef.current = true; setValue(e.target.value) }}
            onFocus={handleFocus}
            onKeyDown={handleKeyDown}
            placeholder="Find anything"
            className="w-full pl-9 pr-4 py-1.5 rounded-full bg-muted border border-transparent focus:border-primary focus:outline-none text-sm"
          />
        </div>
      </form>

      {/* ── Discovery dropdown (empty input) ──────────────────────────────── */}
      {isDiscovery && (isFetchingTrending || hasDiscoveryContent) && (
        <div className="fixed left-2 right-2 top-[3.75rem] sm:absolute sm:left-0 sm:right-auto sm:top-full sm:mt-1 sm:w-full bg-popover border rounded-lg shadow-lg overflow-hidden z-[70]">
          {isFetchingTrending ? (
            <div className="p-3 space-y-1 animate-pulse">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-3 px-1 py-2">
                  <div className="h-7 w-7 rounded-full bg-muted shrink-0" />
                  <div className="h-3 bg-muted rounded" style={{ width: `${40 + i * 9}%` }} />
                </div>
              ))}
            </div>
          ) : (
            <>
              {/* Recent searches */}
              {recentSearches.length > 0 && (
                <div>
                  <div className="flex items-center justify-between px-3 pt-2 pb-1">
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                      Recent
                    </p>
                    <button
                      onClick={clearRecentSearches}
                      className="text-[10px] text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Clear all
                    </button>
                  </div>
                  {recentSearches.map((s) => {
                    dIdx++
                    const idx = dIdx
                    return (
                      <div
                        key={s}
                        onClick={() =>
                          navigate(`/search?q=${encodeURIComponent(s)}&type=posts`, s)
                        }
                        className={`flex items-center gap-3 px-3 py-2 hover:bg-muted cursor-pointer transition-colors ${
                          focusedIndex === idx ? "bg-muted" : ""
                        }`}
                      >
                        <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                        <span className="flex-1 text-sm truncate">{s}</span>
                        <button
                          onClick={(e) => removeRecentSearch(s, e)}
                          className="text-muted-foreground hover:text-foreground p-0.5 transition-colors"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Trending communities */}
              {trendingCommunities.length > 0 && (
                <div>
                  {recentSearches.length > 0 && <hr className="my-1 border-border" />}
                  <p className="px-3 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                    Trending Communities
                  </p>
                  {trendingCommunities.map((c) => {
                    dIdx++
                    const idx = dIdx
                    const memberCount = c.community_memberships?.[0]?.count ?? 0
                    return (
                      <Link
                        key={c.id}
                        href={`/s/${c.community_name}`}
                        onClick={() => {
                          setShowDropdown(false)
                          setFocusedIndex(-1)
                        }}
                        className={`flex items-center gap-3 px-3 py-2 hover:bg-muted transition-colors ${
                          focusedIndex === idx ? "bg-muted" : ""
                        }`}
                      >
                        <Avatar className="h-7 w-7 shrink-0 rounded-full">
                          <AvatarImage src={c.image_url || undefined} className="rounded-full" />
                          <AvatarFallback className="rounded-full text-[10px]">s/</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="text-sm font-medium leading-tight">s/{c.community_name}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatCompactNumber(memberCount)} members
                          </p>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              )}

              {/* Trending posts */}
              {trendingPosts.length > 0 && (
                <div>
                  {(recentSearches.length > 0 || trendingCommunities.length > 0) && (
                    <hr className="my-1 border-border" />
                  )}
                  <div className="flex items-center gap-1.5 px-3 pt-2 pb-1">
                    <TrendingUp className="h-3 w-3 text-muted-foreground" />
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                      Trending Posts
                    </p>
                  </div>
                  {trendingPosts.map((post) => {
                    dIdx++
                    const idx = dIdx
                    return (
                      <Link
                        key={post.id}
                        href={`/s/${post.communities.community_name}/comments/${post.slug}`}
                        onClick={() => {
                          setShowDropdown(false)
                          setFocusedIndex(-1)
                        }}
                        className={`flex items-center gap-3 px-3 py-2.5 hover:bg-muted transition-colors ${
                          focusedIndex === idx ? "bg-muted" : ""
                        }`}
                      >
                        <Avatar className="h-7 w-7 shrink-0 rounded-full">
                          <AvatarImage
                            src={post.communities.image_url || undefined}
                            className="rounded-full"
                          />
                          <AvatarFallback className="rounded-full text-[10px]">s/</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="text-xs text-muted-foreground leading-tight">
                            s/{post.communities.community_name}
                          </p>
                          <p className="text-sm font-medium leading-tight line-clamp-1">
                            {post.title}
                          </p>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ── Suggestions dropdown (has text) ───────────────────────────────── */}
      {showDropdown && value.trim() && (
        <div className="fixed left-2 right-2 top-[3.75rem] sm:absolute sm:left-0 sm:right-auto sm:top-full sm:mt-1 sm:w-full bg-popover border rounded-lg shadow-lg overflow-hidden z-[70]">
          {(isPending || isFetching) && (
            <div className="p-3 space-y-1 animate-pulse">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center gap-3 px-1 py-2">
                  <div className="h-7 w-7 rounded-full bg-muted shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 bg-muted rounded" style={{ width: `${50 + i * 10}%` }} />
                    <div className="h-2.5 w-16 bg-muted rounded" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {!isPending && !isFetching && suggestions.communities.length > 0 && (
            <div>
              <p className="px-3 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                Communities
              </p>
              {suggestions.communities.map((c) => {
                sIdx++
                const idx = sIdx
                const memberCount = c.community_memberships?.[0]?.count ?? 0
                return (
                  <Link
                    key={c.id}
                    href={`/s/${c.community_name}`}
                    onClick={() => {
                      setShowDropdown(false)
                      setFocusedIndex(-1)
                    }}
                    className={`flex items-center gap-3 px-3 py-2 hover:bg-muted transition-colors ${
                      focusedIndex === idx ? "bg-muted" : ""
                    }`}
                  >
                    <Avatar className="h-7 w-7 shrink-0 rounded-full">
                      <AvatarImage src={c.image_url || undefined} className="rounded-full" />
                      <AvatarFallback className="rounded-full text-[10px]">s/</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="text-sm font-medium leading-tight">s/{c.community_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatCompactNumber(memberCount)} members
                      </p>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}

          {!isPending && !isFetching && suggestions.users.length > 0 && (
            <div>
              <p className="px-3 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                People
              </p>
              {suggestions.users.map((u) => {
                sIdx++
                const idx = sIdx
                const karma = (u.post_karma ?? 0) + (u.comment_karma ?? 0)
                return (
                  <Link
                    key={u.account_id}
                    href={`/u/${u.username}`}
                    onClick={() => {
                      setShowDropdown(false)
                      setFocusedIndex(-1)
                    }}
                    className={`flex items-center gap-3 px-3 py-2 hover:bg-muted transition-colors ${
                      focusedIndex === idx ? "bg-muted" : ""
                    }`}
                  >
                    <Avatar className="h-7 w-7 shrink-0 rounded-full">
                      <AvatarImage src={u.avatar_url || undefined} className="rounded-full" />
                      <AvatarFallback className="rounded-full text-[10px]">
                        {u.username?.[0]?.toUpperCase() ?? "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="text-sm font-medium leading-tight">u/{u.username}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatCompactNumber(karma)} karma
                      </p>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}

          {!isPending && !isFetching && (
            <>
              {hasSuggestions && <hr className="my-1 border-border" />}
              {(() => {
                sIdx++
                const idx = sIdx
                return (
                  <button
                    type="button"
                    onClick={() =>
                      navigate(
                        `/search?q=${encodeURIComponent(value.trim())}&type=posts`,
                        value.trim()
                      )
                    }
                    className={`flex items-center gap-3 px-3 py-2.5 w-full text-left hover:bg-muted transition-colors ${
                      focusedIndex === idx ? "bg-muted" : ""
                    }`}
                  >
                    <Search className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="text-sm">
                      Search for{" "}
                      <span className="font-semibold text-primary">"{value}"</span>
                    </span>
                  </button>
                )
              })()}
            </>
          )}
        </div>
      )}
    </div>
  )
}

export default function NavbarSearchBar() {
  return (
    <Suspense>
      <SearchInput />
    </Suspense>
  )
}
