"use client"
import { Tables } from '@/database.types'
import React, { memo } from 'react'
import DOMPurify from 'dompurify';

interface TextContentCommentsProps {
    post: Tables<'posts'>
}

export default memo(function TextContentComments({ post }: TextContentCommentsProps) {
    const cleanContent = DOMPurify.sanitize(post?.content ?? "");
    const isEmptyParagraph = cleanContent.trim() === '<p></p>' || cleanContent.trim() === '';
    return (
        <div className='flex flex-col ml-2 gap-2'>
            <h1 className="text-2xl font-bold tracking-tight">
                {post.title}
            </h1>
            {
                !isEmptyParagraph &&
                <div
                    className='text-primary-foreground-muted prose 
                                prose-strong:text-primary-foreground-muted
                                prose-code:text-primary-foreground-muted
                                prose-li:p:my-0
                                prose-p:my-0
                                text-base
                                prose-h1:text-2xl
                                prose-h2:text-xl
                                prose-h3:text-lg
                                prose-blockquote:p:text-primary-foreground-muted
                                prose-blockquote:border-l-primary
                                prose-headings:text-primary-foreground-muted'
                    dangerouslySetInnerHTML={{ __html: cleanContent }}
                />
            }
        </div>
    )
})
