import Link from "next/link"
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

interface SearchSidebarProps {
  communities: CommunitySuggestion[]
  users: UserSuggestion[]
}

export default function SearchSidebar({ communities, users }: SearchSidebarProps) {
  const hasCommunities = communities.length > 0
  const hasUsers = users.length > 0

  if (!hasCommunities && !hasUsers) return null

  return (
    <div className="overscroll-contain custom-scrollbar hidden lg:flex flex-col w-full max-h-[80vh] h-fit overflow-y-auto sticky top-20 rounded-md bg-black">
      {hasCommunities && (
        <div>
          <p className="px-4 pt-4 pb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Communities
          </p>
          {communities.map((c) => {
            const memberCount = c.community_memberships?.[0]?.count ?? 0
            return (
              <Link
                key={c.id}
                href={`/s/${c.community_name}`}
                className="flex items-center gap-3 px-4 py-2.5 hover:bg-muted transition-colors"
              >
                <Avatar className="h-8 w-8 shrink-0 rounded-full">
                  <AvatarImage src={c.image_url || undefined} className="rounded-full" />
                  <AvatarFallback className="rounded-full text-[10px]">s/</AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="text-sm font-medium leading-tight truncate">s/{c.community_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatCompactNumber(memberCount)} members
                  </p>
                </div>
              </Link>
            )
          })}
        </div>
      )}

      {hasCommunities && hasUsers && <hr className="my-1 border-border" />}

      {hasUsers && (
        <div>
          <p className="px-4 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            People
          </p>
          {users.map((u) => {
            const karma = (u.post_karma ?? 0) + (u.comment_karma ?? 0)
            return (
              <Link
                key={u.account_id}
                href={`/u/${u.username}`}
                className="flex items-center gap-3 px-4 py-2.5 hover:bg-muted transition-colors"
              >
                <Avatar className="h-8 w-8 shrink-0 rounded-full">
                  <AvatarImage src={u.avatar_url || undefined} className="rounded-full" />
                  <AvatarFallback className="rounded-full text-[10px]">
                    {u.username?.[0]?.toUpperCase() ?? "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="text-sm font-medium leading-tight truncate">u/{u.username}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatCompactNumber(karma)} karma
                  </p>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
