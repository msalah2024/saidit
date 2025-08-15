"use client"
import { useGeneralProfile } from '@/app/context/GeneralProfileContext'
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import React from 'react'
import Link from 'next/link'
import { formatDistanceToNowStrict } from 'date-fns'
import Image from 'next/image'

export default function RecentlyVisitedPostsList() {
    const { profile } = useGeneralProfile()
    return (
        <div className="hidden flex-col gap-2 bg-black rounded-2xl my-10 lg:flex max-w-78 w-full overflow-y-auto custom-scrollbar">
            <div className='flex justify-between px-4 w-full mt-4'>
                <p className='text-sm font-medium text-muted-foreground'>RECENT POSTS</p>
                <p className='text-accent hover:underline text-sm hover:cursor-pointer'>Clear</p>
            </div>
            {
                profile &&
                <div className='flex flex-col px-3 gap-2'>
                    {profile.recently_visited_posts.map((post) => (
                        <div key={post.posts?.title} className='flex gap-3'>
                            <div className='flex flex-col gap-1'>
                                <div className='flex items-center gap-2'>
                                    <Avatar className="h-6 w-6">
                                        <AvatarImage src={post.posts?.communities?.image_url || undefined} className="rounded-full" draggable={false} />
                                        <AvatarFallback>s/</AvatarFallback>
                                    </Avatar>
                                    <Link href={`/s/${post.posts?.communities?.community_name}`} className='text-sm text-primary-foreground-muted hover:underline hover:cursor-pointer'>
                                        s/{post.posts?.communities?.community_name}
                                    </Link>
                                    <p className='text-primary-foreground-muted line-clamp-1 space-x-2'>
                                        <span>•</span>
                                        <span className='text-sm'>
                                            {
                                                formatDistanceToNowStrict(new Date(post.posts?.created_at || ""), { addSuffix: true })
                                            }
                                        </span>
                                    </p>
                                </div>
                                {/* <Link href={`/s/${post.posts?.communities?.community_name}/comments/${post.posts.slug}`} className="scroll-m-20 text-primary-foreground-muted line-clamp-2 font-semibold tracking-tight">
                                    {
                                        post.posts?.title
                                    }
                                </Link> */}
                            </div>
                            {
                                post.posts?.post_attachments && post.posts?.post_attachments?.length > 0 &&
                                <Image src={post.posts?.post_attachments?.[0]?.file_url}
                                    alt={post.posts?.post_attachments?.[0]?.alt_text || ""}
                                    width={82}
                                    height={82}
                                    className='shrink-0'
                                    style={{
                                        width: "82px",
                                        height: "82px",
                                        objectFit: "cover",
                                        borderRadius: '0.5rem'
                                    }}
                                />
                            }
                        </div>))}
                </div>
            }
        </div>
    )
}
