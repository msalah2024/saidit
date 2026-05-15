"use client"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { useState, useEffect, useRef, Suspense, useCallback } from "react"
import Link from "next/link"
import { Search, Clock, X, TrendingUp } from "lucide-react"
import Logo from "@/public/assets/images/saidit-logo.svg"
import {
  searchCommunities,
  searchUsers,
  searchPosts,
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

type PostSuggestion = {
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
  posts: PostSuggestion[]
}

const RECENT_KEY = "recent_searches"
const MAX_RECENT = 5

const HOME_ROUTES = ["/", "/hot", "/new", "/top", "/rising"]

const GRADIENT = "bg-gradient-to-r from-[oklch(67.59%_0.1591_140.34)] to-[oklch(55%_0.17_230)]"

function SearchInput() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const [value, setValue] = useState(searchParams.get("q") ?? "")

  const communityMatch = pathname.match(/^\/s\/([^/]+)/)
  const detectedCommunity = communityMatch?.[1] ?? null
  const [scopeCleared, setScopeCleared] = useState(false)
  const activeCommunity = scopeCleared ? null : detectedCommunity
  const [suggestions, setSuggestions] = useState<Suggestions>({ communities: [], users: [], posts: [] })
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
  const mobileInputRef = useRef<HTMLInputElement>(null)
  const mobileScrollRef = useRef<HTMLDivElement>(null)
  const hasFetchedTrending = useRef(false)
  const isUserTypingRef = useRef(false)

  useEffect(() => {
    const q = searchParams.get("q")
    if (q === null) return
    isUserTypingRef.current = false
    setValue(q)
  }, [searchParams])

  useEffect(() => { setScopeCleared(false) }, [detectedCommunity])
  useEffect(() => { setSuggestions({ communities: [], users: [], posts: [] }) }, [activeCommunity])

  useEffect(() => {
    if (HOME_ROUTES.includes(pathname)) {
      isUserTypingRef.current = false
      setValue("")
      setShowDropdown(false)
    }
  }, [pathname])

  useEffect(() => {
    getRecentSearches().then((result) => {
      isAuthenticatedRef.current = result.authenticated
      if (result.authenticated && result.data) {
        setRecentSearches(result.data)
      } else {
        try {
          const stored = localStorage.getItem(RECENT_KEY)
          if (stored) setRecentSearches(JSON.parse(stored))
        } catch {}
      }
    })
  }, [])

  // Close on outside click (desktop)
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

  // Lock body scroll when dropdown is open on desktop
  useEffect(() => {
    if (!showDropdown) return
    const prevent = (e: Event) => e.preventDefault()
    document.addEventListener("wheel", prevent, { passive: false })
    return () => document.removeEventListener("wheel", prevent)
  }, [showDropdown])

  // Lock body scroll when overlay is open; on mobile also block touchmove
  // but allow it inside the overlay's own scroll container
  useEffect(() => {
    if (!showDropdown) return
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth
    document.documentElement.style.setProperty("--scrollbar-width", `${scrollbarWidth}px`)
    document.body.style.overflow = "hidden"
    document.body.style.paddingRight = `${scrollbarWidth}px`

    const blockTouch = (e: TouchEvent) => {
      if (mobileScrollRef.current?.contains(e.target as Node)) return
      e.preventDefault()
    }
    document.addEventListener("touchmove", blockTouch, { passive: false })

    return () => {
      document.body.style.overflow = ""
      document.body.style.paddingRight = ""
      document.documentElement.style.removeProperty("--scrollbar-width")
      document.removeEventListener("touchmove", blockTouch)
    }
  }, [showDropdown])

  const fetchSuggestions = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSuggestions({ communities: [], users: [], posts: [] })
      setShowDropdown(false)
      setIsPending(false)
      return
    }
    setIsFetching(true)
    if (activeCommunity) {
      const result = await searchPosts(query, "relevance", "all", activeCommunity)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const posts = ((result.data as any[]) ?? []).slice(0, 5) as PostSuggestion[]
      setSuggestions({ communities: [], users: [], posts })
    } else {
      const [commResult, usersResult] = await Promise.all([
        searchCommunities(query),
        searchUsers(query),
      ])
      setSuggestions({
        communities: (commResult.data as CommunitySuggestion[] ?? []).slice(0, 4),
        users: (usersResult.data as UserSuggestion[] ?? []).slice(0, 3),
        posts: [],
      })
    }
    setShowDropdown(true)
    setIsFetching(false)
    setIsPending(false)
  }, [activeCommunity])

  useEffect(() => {
    if (!value.trim()) {
      setIsPending(false)
      setSuggestions({ communities: [], users: [], posts: [] })
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

  const buildSearchUrl = useCallback((q: string) => {
    const params: Record<string, string> = { q, type: "posts" }
    if (activeCommunity) params.community = activeCommunity
    return `/search?${new URLSearchParams(params).toString()}`
  }, [activeCommunity])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = value.trim()
    if (!trimmed) return
    navigate(buildSearchUrl(trimmed), trimmed)
  }

  const handleFocus = () => {
    setShowDropdown(true)
    if (!value.trim()) fetchTrendingData()
  }

  const handleCancel = () => {
    setValue("")
    setSuggestions({ communities: [], users: [], posts: [] })
    setShowDropdown(false)
    setFocusedIndex(-1)
    inputRef.current?.blur()
  }

  const isDiscovery = showDropdown && !value.trim()

  const allDiscoveryItems = [
    ...recentSearches.map((s) => ({ type: "recent" as const, data: s })),
    ...trendingCommunities.map((c) => ({ type: "community" as const, data: c })),
    ...trendingPosts.map((p) => ({ type: "trending_post" as const, data: p })),
  ]

  const allSuggestionItems = activeCommunity
    ? [
        ...suggestions.posts.map((p) => ({ type: "post_result" as const, data: p })),
        { type: "search" as const, data: null },
      ]
    : [
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
      } else if (item.type === "post_result") {
        const p = item.data as PostSuggestion
        navigate(`/s/${p.communities.community_name}/comments/${p.slug}`)
      } else {
        const trimmed = value.trim()
        if (trimmed) navigate(buildSearchUrl(trimmed), trimmed)
      }
    } else if (e.key === "Escape") {
      handleCancel()
    }
  }

  const hasSuggestions =
    suggestions.communities.length > 0 || suggestions.users.length > 0 || suggestions.posts.length > 0
  const hasDiscoveryContent =
    recentSearches.length > 0 || trendingCommunities.length > 0 || trendingPosts.length > 0

  // ── Shared suggestion body ────────────────────────────────────────────────
  // per-render counters — must be reset before each use
  let dIdx = -1
  let sIdx = -1

  const discoveryBody = (
    <>
      {isFetchingTrending ? (
        <div className="p-3 space-y-1 animate-pulse">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-3 px-1 py-3">
              <div className="h-8 w-8 rounded-full bg-muted shrink-0" />
              <div className="h-3 bg-muted rounded" style={{ width: `${40 + i * 9}%` }} />
            </div>
          ))}
        </div>
      ) : (
        <>
          {recentSearches.length > 0 && (
            <div>
              <div className="flex items-center justify-between px-4 pt-3 pb-1">
                <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                  Recent
                </p>
                <button
                  onClick={clearRecentSearches}
                  className="text-[11px] text-muted-foreground hover:text-foreground transition-colors"
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
                    onClick={() => navigate(buildSearchUrl(s), s)}
                    className={`flex items-center gap-3 px-4 py-3.5 hover:bg-muted cursor-pointer transition-colors ${focusedIndex === idx ? "bg-muted" : ""}`}
                  >
                    <Clock className="h-5 w-5 text-muted-foreground shrink-0" />
                    <span className="flex-1 text-sm truncate">{s}</span>
                    <button
                      onClick={(e) => removeRecentSearch(s, e)}
                      className="text-muted-foreground hover:text-foreground p-1 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )
              })}
            </div>
          )}

          {trendingCommunities.length > 0 && (
            <div>
              {recentSearches.length > 0 && <hr className="my-2 border-border" />}
              <p className="px-4 pt-2 pb-1 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
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
                    onClick={() => { setShowDropdown(false); setFocusedIndex(-1) }}
                    className={`flex items-center gap-3 px-4 py-3.5 hover:bg-muted transition-colors ${focusedIndex === idx ? "bg-muted" : ""}`}
                  >
                    <Avatar className="h-8 w-8 shrink-0 rounded-full">
                      <AvatarImage src={c.image_url || undefined} className="rounded-full" />
                      <AvatarFallback className="rounded-full text-[10px]">s/</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="text-sm font-medium leading-tight">s/{c.community_name}</p>
                      <p className="text-xs text-muted-foreground">{formatCompactNumber(memberCount)} members</p>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}

          {trendingPosts.length > 0 && (
            <div>
              {(recentSearches.length > 0 || trendingCommunities.length > 0) && <hr className="my-2 border-border" />}
              <div className="flex items-center gap-1.5 px-4 pt-2 pb-1">
                <TrendingUp className="h-3.5 w-3.5 text-muted-foreground" />
                <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
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
                    onClick={() => { setShowDropdown(false); setFocusedIndex(-1) }}
                    className={`flex items-center gap-3 px-4 py-3.5 hover:bg-muted transition-colors ${focusedIndex === idx ? "bg-muted" : ""}`}
                  >
                    <Avatar className="h-8 w-8 shrink-0 rounded-full">
                      <AvatarImage src={post.communities.image_url || undefined} className="rounded-full" />
                      <AvatarFallback className="rounded-full text-[10px]">s/</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground leading-tight">s/{post.communities.community_name}</p>
                      <p className="text-sm font-medium leading-tight line-clamp-2">{post.title}</p>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </>
      )}
    </>
  )

  const suggestionsBody = (
    <>
      {(isPending || isFetching) && (
        <div className="p-3 space-y-1 animate-pulse">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-3 px-1 py-3">
              <div className="h-8 w-8 rounded-full bg-muted shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 bg-muted rounded" style={{ width: `${50 + i * 10}%` }} />
                <div className="h-2.5 w-16 bg-muted rounded" />
              </div>
            </div>
          ))}
        </div>
      )}

      {!isPending && !isFetching && activeCommunity && suggestions.posts.length > 0 && (
        <div>
          <p className="px-4 pt-3 pb-1 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            Posts in s/{activeCommunity}
          </p>
          {suggestions.posts.map((p) => {
            sIdx++
            const idx = sIdx
            return (
              <Link
                key={p.id}
                href={`/s/${p.communities.community_name}/comments/${p.slug}`}
                onClick={() => { setShowDropdown(false); setFocusedIndex(-1) }}
                className={`flex items-center gap-3 px-4 py-3.5 hover:bg-muted transition-colors ${focusedIndex === idx ? "bg-muted" : ""}`}
              >
                <Avatar className="h-8 w-8 shrink-0 rounded-full">
                  <AvatarImage src={p.communities.image_url || undefined} className="rounded-full" />
                  <AvatarFallback className="rounded-full text-[10px]">s/</AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground leading-tight">s/{p.communities.community_name}</p>
                  <p className="text-sm font-medium leading-tight line-clamp-2">{p.title}</p>
                </div>
              </Link>
            )
          })}
        </div>
      )}

      {!isPending && !isFetching && !activeCommunity && suggestions.communities.length > 0 && (
        <div>
          <p className="px-4 pt-3 pb-1 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
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
                onClick={() => { setShowDropdown(false); setFocusedIndex(-1) }}
                className={`flex items-center gap-3 px-4 py-3.5 hover:bg-muted transition-colors ${focusedIndex === idx ? "bg-muted" : ""}`}
              >
                <Avatar className="h-8 w-8 shrink-0 rounded-full">
                  <AvatarImage src={c.image_url || undefined} className="rounded-full" />
                  <AvatarFallback className="rounded-full text-[10px]">s/</AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="text-sm font-medium leading-tight">s/{c.community_name}</p>
                  <p className="text-xs text-muted-foreground">{formatCompactNumber(memberCount)} members</p>
                </div>
              </Link>
            )
          })}
        </div>
      )}

      {!isPending && !isFetching && !activeCommunity && suggestions.users.length > 0 && (
        <div>
          <p className="px-4 pt-3 pb-1 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
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
                onClick={() => { setShowDropdown(false); setFocusedIndex(-1) }}
                className={`flex items-center gap-3 px-4 py-3.5 hover:bg-muted transition-colors ${focusedIndex === idx ? "bg-muted" : ""}`}
              >
                <Avatar className="h-8 w-8 shrink-0 rounded-full">
                  <AvatarImage src={u.avatar_url || undefined} className="rounded-full" />
                  <AvatarFallback className="rounded-full text-[10px]">
                    {u.username?.[0]?.toUpperCase() ?? "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="text-sm font-medium leading-tight">u/{u.username}</p>
                  <p className="text-xs text-muted-foreground">{formatCompactNumber(karma)} karma</p>
                </div>
              </Link>
            )
          })}
        </div>
      )}

      {!isPending && !isFetching && (
        <>
          {hasSuggestions && <hr className="my-2 border-border" />}
          {(() => {
            sIdx++
            const idx = sIdx
            return (
              <button
                type="button"
                onClick={() => navigate(buildSearchUrl(value.trim()), value.trim())}
                className={`flex items-center gap-3 px-4 py-3.5 w-full text-left hover:bg-muted transition-colors ${focusedIndex === idx ? "bg-muted" : ""}`}
              >
                <Search className="h-5 w-5 text-muted-foreground shrink-0" />
                <span className="text-sm">
                  Search for <span className="font-semibold text-primary">"{value}"</span>
                </span>
              </button>
            )
          })()}
        </>
      )}
    </>
  )

  return (
    <div ref={containerRef} className="w-full flex items-center gap-2">
      <div className="flex-1 relative">

        {/* ── Input bar ───────────────────────────────────────────────────── */}
        <form onSubmit={handleSubmit}>
          <div className={`rounded-full p-[1.5px] ${GRADIENT}`}>
            <div className="flex items-center pl-9 pr-3 py-1.5 rounded-full bg-muted relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={Logo.src} alt="Saidit" className="h-4 w-auto" />
              </div>
              {activeCommunity && (
                <span className="flex items-center gap-1 bg-primary/20 text-primary text-xs rounded-full px-2 py-0.5 mr-1.5 shrink-0 whitespace-nowrap">
                  s/{activeCommunity}
                  <button type="button" onClick={() => setScopeCleared(true)} className="hover:text-primary/70 transition-colors">
                    <X className="h-2.5 w-2.5" />
                  </button>
                </span>
              )}
              <input
                ref={inputRef}
                value={value}
                onChange={(e) => { isUserTypingRef.current = true; setValue(e.target.value) }}
                onFocus={handleFocus}
                onKeyDown={handleKeyDown}
                placeholder={activeCommunity ? `Search in s/${activeCommunity}` : "Find anything"}
                className="bg-transparent outline-none flex-1 min-w-0 text-base sm:text-sm"
              />
            </div>
          </div>
        </form>

        {/* ── Desktop discovery dropdown ───────────────────────────────── */}
        {isDiscovery && (isFetchingTrending || hasDiscoveryContent) && (
          <div className="hidden sm:block absolute inset-x-0 top-full mt-1 overflow-hidden bg-popover border rounded-lg shadow-lg z-[70]">
            {discoveryBody}
          </div>
        )}

        {/* ── Desktop suggestions dropdown ─────────────────────────────── */}
        {showDropdown && value.trim() && (
          <div className="hidden sm:block absolute inset-x-0 top-full mt-1 overflow-hidden bg-popover border rounded-lg shadow-lg z-[70]">
            {suggestionsBody}
          </div>
        )}

      </div>{/* end flex-1 relative */}

      {/* ── Mobile full-screen overlay ────────────────────────────────────── */}
      {showDropdown && (
        <div className="sm:hidden fixed inset-x-0 top-14 bottom-0 z-[70] bg-background flex flex-col">

          {/* Header: search input + Cancel */}
          <div className="flex items-center gap-3 px-3 py-2 border-b">
            <form onSubmit={handleSubmit} className="flex-1">
              <div className={`rounded-full p-[1.5px] ${GRADIENT}`}>
                <div className="flex items-center pl-9 pr-3 py-2 rounded-full bg-muted relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={Logo.src} alt="Saidit" className="h-4 w-auto" />
                  </div>
                  {activeCommunity && (
                    <span className="flex items-center gap-1 bg-primary/20 text-primary text-xs rounded-full px-2 py-0.5 mr-1.5 shrink-0 whitespace-nowrap">
                      s/{activeCommunity}
                      <button type="button" onClick={() => setScopeCleared(true)} className="hover:text-primary/70 transition-colors">
                        <X className="h-2.5 w-2.5" />
                      </button>
                    </span>
                  )}
                  <input
                    ref={mobileInputRef}
                    autoFocus
                    value={value}
                    onChange={(e) => { isUserTypingRef.current = true; setValue(e.target.value) }}
                    onKeyDown={handleKeyDown}
                    placeholder={activeCommunity ? `Search in s/${activeCommunity}` : "Find anything"}
                    className="bg-transparent outline-none flex-1 min-w-0 text-base"
                  />
                  {value && (
                    <button
                      type="button"
                      onClick={() => { setValue(""); setSuggestions({ communities: [], users: [], posts: [] }) }}
                      className="text-muted-foreground hover:text-foreground transition-colors ml-1"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </form>
            <button
              type="button"
              onClick={handleCancel}
              className="text-sm font-medium text-primary whitespace-nowrap shrink-0"
            >
              Cancel
            </button>
          </div>

          {/* Scrollable suggestions body */}
          <div
            ref={mobileScrollRef}
            className="flex-1 overflow-y-auto overscroll-contain"
          >
            {isDiscovery && (isFetchingTrending || hasDiscoveryContent) && discoveryBody}
            {value.trim() && suggestionsBody}
          </div>

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
