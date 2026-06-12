import { PostsWithAuthorAndCommunity } from "@/complexTypes"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ArrowUp, BadgeCheck, MessageCircle } from "lucide-react"
import { formatRelativeTime } from "@/lib/formatDate"
import { formatCompactNumber } from "@/lib/formatNumbers"
import Image from "next/image"

function stripHTMLTags(html: string): string {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim()
}

export default function SearchPostResult({ post }: { post: PostsWithAuthorAndCommunity }) {
  const thumbnail = post.post_attachments?.[0]
  const postUrl = `/s/${post.communities.community_name}/comments/${post.slug}`
  const communityUrl = `/s/${post.communities.community_name}`
  const snippet =
    post.content && !post.deleted ? stripHTMLTags(post.content).slice(0, 200) : null

  return (
    <div className="relative border rounded-lg p-4 bg-saidit-black hover:border-muted-foreground/40 transition-colors cursor-pointer">
      {/* Invisible full-card link — sits behind all content */}
      <Link href={postUrl} className="absolute inset-0 rounded-lg" aria-label={post.title} />

      {/* pointer-events-none wrapper so clicks fall through to the link above,
          except for explicitly re-enabled interactive elements */}
      <div className="pointer-events-none">
        {/* Meta row */}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2 flex-wrap">
          <Link
            href={communityUrl}
            className="pointer-events-auto flex items-center gap-1 hover:underline"
          >
            <Avatar className="h-4 w-4 rounded-full">
              <AvatarImage
                src={post.communities.image_url || undefined}
                className="rounded-full"
              />
              <AvatarFallback className="rounded-full text-[8px]">s/</AvatarFallback>
            </Avatar>
            <span className="font-semibold text-foreground">
              s/{post.communities.community_name}
            </span>
            {post.communities.verified && (
              <BadgeCheck className="text-background" fill="#477ed8" size={12} />
            )}
          </Link>
          <span>•</span>
          <span>Posted by u/{post.users?.username ?? "[deleted]"}</span>
          <span>•</span>
          <span>{formatRelativeTime(post.created_at)}</span>
        </div>

        {/* Title + thumbnail */}
        <div className="flex gap-3 items-start">
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-base leading-snug line-clamp-2">{post.title}</p>
            {snippet && snippet !== "" && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{snippet}</p>
            )}
          </div>
          {thumbnail && (
            <Image
              src={thumbnail.file_url}
              alt={thumbnail.alt_text ?? ""}
              width={80}
              height={60}
              className="rounded object-cover shrink-0"
              style={{ width: 80, height: 60 }}
            />
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <ArrowUp className="h-3.5 w-3.5" />
            <span>{formatCompactNumber(post.net_votes)} votes</span>
          </div>
          <div className="flex items-center gap-1">
            <MessageCircle className="h-3.5 w-3.5" />
            <span>{formatCompactNumber(post.comments?.[0]?.count ?? 0)} comments</span>
          </div>
        </div>
      </div>
    </div>
  )
}
