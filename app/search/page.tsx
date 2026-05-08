import { searchPosts, searchCommunities, searchUsers } from "@/app/actions"
import SearchTabs from "@/components/search/SearchTabs"
import SearchFilters from "@/components/search/SearchFilters"
import SearchPostResult from "@/components/search/SearchPostResult"
import SearchCommunityResult from "@/components/search/SearchCommunityResult"
import SearchUserResult from "@/components/search/SearchUserResult"
import SearchSidebar from "@/components/search/SearchSidebar"
import { PostsWithAuthorAndCommunity } from "@/complexTypes"
import { Search } from "lucide-react"
import { Suspense } from "react"

interface SearchPageProps {
  searchParams: Promise<{
    q?: string
    type?: string
    sort?: string
    t?: string
  }>
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q = "", type = "posts", sort = "relevance", t = "all" } = await searchParams
  const query = q.trim()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let postsData: PostsWithAuthorAndCommunity[] = []
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let communitiesData: any[] = []
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let usersData: any[] = []
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let sidebarCommunities: any[] = []
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let sidebarUsers: any[] = []

  if (query) {
    const [commResult, usersResult] = await Promise.all([
      searchCommunities(query),
      searchUsers(query),
    ])
    sidebarCommunities = (commResult.data ?? []).slice(0, 4)
    sidebarUsers = (usersResult.data ?? []).slice(0, 3)

    if (type === "posts") {
      const result = await searchPosts(query, sort, t)
      postsData = (result.data as PostsWithAuthorAndCommunity[]) ?? []
    } else if (type === "communities") {
      communitiesData = commResult.data ?? []
    } else if (type === "people") {
      usersData = usersResult.data ?? []
    }
  }

  const postResults = (
    <div className="flex flex-col gap-3 mt-4">
      {postsData.length === 0 ? (
        <EmptyState query={query} />
      ) : (
        postsData.map((post) => <SearchPostResult key={post.id} post={post} />)
      )}
    </div>
  )

  const communityResults = (
    <div className="flex flex-col gap-3 mt-4">
      {communitiesData.length === 0 ? (
        <EmptyState query={query} />
      ) : (
        communitiesData.map((c) => <SearchCommunityResult key={c.id} community={c} />)
      )}
    </div>
  )

  const peopleResults = (
    <div className="flex flex-col gap-3 mt-4">
      {usersData.length === 0 ? (
        <EmptyState query={query} />
      ) : (
        usersData.map((u) => <SearchUserResult key={u.account_id} user={u} />)
      )}
    </div>
  )

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {!query && (
        <div className="flex flex-col items-center justify-center py-24 text-muted-foreground gap-3">
          <Search className="h-10 w-10" />
          <p className="text-lg font-medium">Search Saidit</p>
          <p className="text-sm">Find posts, communities, and people</p>
        </div>
      )}

      {query && (
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-3 lg:col-span-2">
            <p className="text-sm text-muted-foreground mb-4">
              Results for{" "}
              <span className="font-semibold text-foreground">"{query}"</span>
            </p>
            <Suspense>
              <SearchTabs q={query} type={type}>
                {type === "posts" ? (
                  <Suspense>
                    <SearchFilters q={query} sort={sort} t={t}>
                      {postResults}
                    </SearchFilters>
                  </Suspense>
                ) : type === "communities" ? (
                  communityResults
                ) : (
                  peopleResults
                )}
              </SearchTabs>
            </Suspense>
          </div>

          <div className="hidden lg:block">
            <SearchSidebar communities={sidebarCommunities} users={sidebarUsers} />
          </div>
        </div>
      )}
    </div>
  )
}

function EmptyState({ query }: { query: string }) {
  return (
    <div className="py-20 text-center text-muted-foreground">
      <p className="text-lg font-medium">No results for "{query}"</p>
      <p className="text-sm mt-1">Try different keywords or check your spelling</p>
    </div>
  )
}
