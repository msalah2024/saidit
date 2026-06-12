"use client"
import { useEffect, useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { useProfile } from "@/app/context/ProfileContext"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"
import PulseLogo from "@/components/PulseLogo"
import { formatCompactNumber } from "@/lib/formatNumbers"

type CommunityRow = {
  community_name: string
  description: string | null
  image_url: string | null
  community_memberships: { count: number }[]
}

export default function ProfileCommunitiesTab() {
  const supabase = createClient()
  const { profile } = useProfile()
  const [communities, setCommunities] = useState<CommunityRow[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      setIsLoading(true)
      const { data, error } = await supabase
        .from('community_memberships')
        .select('joined_at, communities!inner(community_name, description, image_url, community_memberships(count))')
        .eq('user_id', profile.account_id)
        .order('joined_at', { ascending: false })

      if (error) { console.error(error); setIsLoading(false); return }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setCommunities((data ?? []).map((row: any) => row.communities).filter(Boolean))
      setIsLoading(false)
    }
    load()
  }, [profile.account_id, supabase])

  if (isLoading) {
    return (
      <div className="flex justify-center py-16 border-t">
        <PulseLogo />
      </div>
    )
  }

  if (communities.length === 0) {
    return (
      <div className="flex items-center justify-center border-t">
        <h4 className="mt-20 border-b pb-2 w-fit scroll-m-20 text-xl font-semibold tracking-tight">
          Not a member of any communities
        </h4>
      </div>
    )
  }

  return (
    <div className="border-t pt-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {communities.map((c) => {
          const memberCount = c.community_memberships?.[0]?.count ?? 0
          return (
            <Link
              key={c.community_name}
              href={`/s/${c.community_name}`}
              className="flex items-center gap-3 bg-card border rounded-xl p-4 hover:bg-muted transition-colors"
            >
              <Avatar className="w-12 h-12 shrink-0 rounded-full">
                <AvatarImage src={c.image_url || undefined} className="rounded-full" draggable={false} />
                <AvatarFallback className="rounded-full text-sm">s/</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="font-semibold text-sm truncate">s/{c.community_name}</p>
                {c.description && (
                  <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{c.description}</p>
                )}
                <p className="text-xs text-muted-foreground mt-0.5">
                  {formatCompactNumber(memberCount)} {memberCount === 1 ? "member" : "members"}
                </p>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
