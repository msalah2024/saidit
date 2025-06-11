import { Tables } from '@/database.types'
import React, { memo } from 'react'
import DOMPurify from 'dompurify';

interface TextContentProps {
    post: Tables<'posts'>
}

export default memo(function TextContent({ post }: TextContentProps) {
    const cleanContent = DOMPurify.sanitize(post?.content ?? "");
    const isEmptyParagraph = cleanContent.trim() === '<p></p>' || cleanContent.trim() === '';

    return (
        <div className='flex flex-col ml-2 gap-2 cursor-pointer select-none'>
            <h4 className="scroll-m-20 text-[1.1rem] font-medium tracking-tight">
                {post.title}
            </h4>
            {
                !isEmptyParagraph &&
                <div
                    className='text-primary-foreground-muted line-clamp-6'
                    dangerouslySetInnerHTML={{ __html: cleanContent }}
                />
            }

        </div>
    )
})
