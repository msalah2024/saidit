import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { BadgeCheck } from "lucide-react"
import { formatCompactNumber } from "@/lib/formatNumbers"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function SearchUserResult({ user }: { user: any }) {
  const totalKarma = (user.post_karma ?? 0) + (user.comment_karma ?? 0)

  return (
    <Link
      href={`/u/${user.username}`}
      className="flex items-start gap-3 border rounded-lg p-4 bg-saidit-black hover:border-muted-foreground/40 transition-colors"
    >
      <Avatar className="h-12 w-12 shrink-0 rounded-full">
        <AvatarImage src={user.avatar_url || undefined} className="rounded-full" />
        <AvatarFallback className="rounded-full">
          {user.username?.[0]?.toUpperCase() ?? "U"}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="font-semibold">u/{user.username}</span>
          {user.verified && (
            <BadgeCheck className="text-background shrink-0" fill="#477ed8" size={16} />
          )}
        </div>

        {user.display_name && (
          <p className="text-sm text-muted-foreground">{user.display_name}</p>
        )}

        <p className="text-xs text-muted-foreground mt-1">
          {formatCompactNumber(totalKarma)} karma
        </p>

        {user.description && (
          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
            {user.description}
          </p>
        )}
      </div>
    </Link>
  )
}
