"use client"
import { useGeneralProfile } from '@/app/context/GeneralProfileContext'
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import React from 'react'
import Link from 'next/link'
import { formatDistanceToNowStrict } from 'date-fns'
import Image from 'next/image'
import { Images } from 'lucide-react'
import { formatCompactNumber } from '@/lib/formatNumbers'
import { ScrollArea } from "@/components/ui/scroll-area"

export default function RecentlyVisitedPostsList() {
    const { profile } = useGeneralProfile()
    return (
        <ScrollArea className="max-h-[48rem] flex-col gap-2 pr-2 mx-1 my-1 max-w-80 w-full">
            <div className='flex justify-between px-4 w-full mt-4'>
                <p className='text-sm font-medium text-muted-foreground'>RECENT POSTS</p>
                <p className='text-accent hover:underline text-sm hover:cursor-pointer'>Clear</p>
            </div>
            {
                profile &&
                <div className='flex flex-col px-3'>
                    {profile.recently_visited_posts?.map((post) => (
                        <div key={post.posts?.title} className='flex gap-3 py-3 border-b last:border-none'>
                            <div className='flex flex-col gap-2'>
                                <div className='flex items-center gap-2'>
                                    <Link href={`/s/${post.posts?.communities?.community_name}`}
                                        className='text-sm text-primary-foreground-muted 
                                        hover:underline hover:cursor-pointer flex items-center gap-1.5'>
                                        <Avatar className="h-6 w-6">
                                            <AvatarImage src={post.posts?.communities?.image_url || undefined} className="rounded-full" draggable={false} />
                                            <AvatarFallback>s/</AvatarFallback>
                                        </Avatar>
                                        s/{post.posts?.communities?.community_name}
                                    </Link>
                                    <p className='text-primary-foreground-muted flex items-center space-x-2'>
                                        <span>•</span>
                                        <span className='text-sm line-clamp-1'>
                                            {
                                                formatDistanceToNowStrict(new Date(post.posts?.created_at || ""), { addSuffix: true })
                                            }
                                        </span>
                                    </p>
                                </div>
                                <Link href={`/s/${post.posts?.communities?.community_name}/comments/${post.posts?.slug}`}
                                    className="scroll-m-20 text-primary-foreground-muted w-fit 
                                    line-clamp-2 font-semibold tracking-tight hover:underline hover:cursor-pointer">
                                    {
                                        post.posts?.title
                                    }
                                </Link>
                                <div className='flex gap-2'>
                                    <p className='text-sm text-primary-foreground-muted'>
                                        {formatCompactNumber(post.posts?.upvote_count)} upvotes
                                    </p>
                                    <span className='text-primary-foreground-muted'>•</span>
                                    <p className='text-sm text-primary-foreground-muted'>
                                        {formatCompactNumber(post.posts?.comments_count)} comments
                                    </p>
                                </div>
                            </div>
                            {
                                post.posts?.post_attachments && post.posts?.post_attachments?.length > 0 &&
                                <Link
                                    className='shrink-0 relative'
                                    href={`/s/${post.posts?.communities?.community_name}/comments/${post.posts?.slug}`}>
                                    <Image src={post.posts?.post_attachments?.[0]?.file_url}
                                        alt={post.posts?.post_attachments?.[0]?.alt_text || ""}
                                        width={82}
                                        height={82}
                                        style={{
                                            width: "82px",
                                            height: "82px",
                                            objectFit: "cover",
                                            borderRadius: '0.5rem'
                                        }}
                                    />
                                    {
                                        post.posts.post_attachments.length > 1 &&
                                        <div className='bg-background/80 flex items-center justify-center gap-1 rounded-full px-2 py-1 absolute bottom-3 left-1'>
                                            <Images size={12} />
                                            <p className='text-xs select-none'>
                                                {post.posts.post_attachments.length}
                                            </p>
                                        </div>
                                    }
                                </Link>
                            }
                        </div>
                    ))}
                </div>
            }
        </ScrollArea>
    )
}
