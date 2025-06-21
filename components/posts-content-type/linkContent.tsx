import React from 'react'
import Link from 'next/link'
import { PostsWithAuthor } from '@/complexTypes'

interface linkContentProps {
    post: PostsWithAuthor
}

export default function LinkContent({ post }: linkContentProps) {

    return (
        <div>
            <h4 className="scroll-m-20 text-[1.1rem] font-medium tracking-tight">
                {post.title}
            </h4>
            {
                post.url &&
                <Link href={post.url} className='text-accent line-clamp-1 hover:underline'>
                    {post.url}
                </Link>
            }
        </div>
    )
}
