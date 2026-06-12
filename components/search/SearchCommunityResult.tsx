import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { BadgeCheck, Users } from "lucide-react"
import { formatCompactNumber } from "@/lib/formatNumbers"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function SearchCommunityResult({ community }: { community: any }) {
  const memberCount = community.community_memberships?.[0]?.count ?? 0

  return (
    <Link
      href={`/s/${community.community_name}`}
      className="flex items-start gap-3 border rounded-lg p-4 bg-saidit-black hover:border-muted-foreground/40 transition-colors"
    >
      <Avatar className="h-12 w-12 shrink-0 rounded-full">
        <AvatarImage src={community.image_url || undefined} className="rounded-full" />
        <AvatarFallback className="rounded-full">s/</AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="font-semibold">s/{community.community_name}</span>
          {community.verified && (
            <BadgeCheck className="text-background shrink-0" fill="#477ed8" size={16} />
          )}
        </div>

        {community.display_name && (
          <p className="text-sm text-muted-foreground">{community.display_name}</p>
        )}

        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
          <Users className="h-3.5 w-3.5" />
          <span>{formatCompactNumber(memberCount)} members</span>
        </div>

        {community.description && (
          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
            {community.description}
          </p>
        )}
      </div>
    </Link>
  )
}
