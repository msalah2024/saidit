"use client"
import Link from "next/link"
import { formatDistanceToNowStrict } from "date-fns"
import { ArrowUp } from "lucide-react"

export type ProfileComment = {
  id: string
  body: string | null
  stripped_body: string | null
  created_at: string
  net_votes: number
  slug: string
  deleted: boolean
  users: { username: string | null; avatar_url: string | null; verified: boolean } | null
  comments_votes: { vote_type: "upvote" | "downvote"; voter_id: string | null; id: string }[]
  posts: {
    title: string
    slug: string
    communities: { community_name: string; image_url: string | null } | null
  } | null
}

interface ProfileCommentCardProps {
  comment: ProfileComment
}

export default function ProfileCommentCard({ comment }: ProfileCommentCardProps) {
  const community = comment.posts?.communities
  const post = comment.posts

  return (
    <div className="w-full max-w-4xl my-2 rounded-md bg-saidit-black px-4 py-3 flex flex-col gap-2">
      {/* Header: community + post link + timestamp */}
      <div className="flex items-start justify-between gap-2 text-sm text-muted-foreground">
        <div className="flex items-center gap-1.5 flex-wrap min-w-0">
          {community && (
            <Link
              href={`/s/${community.community_name}`}
              className="hover:underline text-primary-foreground-muted font-medium shrink-0"
            >
              s/{community.community_name}
            </Link>
          )}
          {post && (
            <>
              <span className="shrink-0">•</span>
              <Link
                href={`/s/${community?.community_name}/comments/${post.slug}`}
                className="hover:underline truncate text-muted-foreground"
              >
                {post.title}
              </Link>
            </>
          )}
        </div>
        <span className="shrink-0 text-xs">
          {formatDistanceToNowStrict(new Date(comment.created_at), { addSuffix: true })}
        </span>
      </div>

      {/* Comment body */}
      <Link
        href={`/s/${community?.community_name}/comments/${post?.slug}`}
        className="text-sm text-primary-foreground-muted line-clamp-4 leading-relaxed hover:underline"
      >
        {comment.stripped_body || comment.body}
      </Link>

      {/* Footer: vote score */}
      <div className="flex items-center gap-1 text-xs text-muted-foreground">
        <ArrowUp size={13} />
        <span>{comment.net_votes} points</span>
      </div>
    </div>
  )
}
