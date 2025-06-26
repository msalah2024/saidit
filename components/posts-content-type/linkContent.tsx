"use client"
import React from 'react'
import Link from 'next/link'
import { PostsWithAuthor } from '@/complexTypes'
import { usePathname } from 'next/navigation'

interface linkContentProps {
    post: PostsWithAuthor
}

export default function LinkContent({ post }: linkContentProps) {
    const pathname = usePathname()
    const isPostPage = pathname.includes("/comments")

    return (
        <div className='ml-2 relative'>
            <h1 className={`scroll-m-20 ${isPostPage ? 'text-2xl' : 'text-lg'} font-medium tracking-tight`}>
                {post.title}
            </h1>
            {
                post.url &&
                <Link href={post.url} target="_blank" className='text-accent line-clamp-1 hover:underline sm:w-fit z-10 relative'>
                    {post.url}
                </Link>
            }
        </div>
    )
}
