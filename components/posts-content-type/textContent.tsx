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
        <div className='flex flex-col ml-2 gap-0 cursor-pointer select-none'>
            <h4 className="scroll-m-20 text-[1.1rem] font-medium tracking-tight">
                {post.title}
            </h4>
            {
                !isEmptyParagraph &&
                <div
                    className='text-primary-foreground-muted prose
                                prose-strong:text-primary-foreground-muted
                                prose-code:text-primary-foreground-muted
                                prose-li:p:my-0
                                prose-p:my-0
                                prose-blockquote:p:text-primary-foreground-muted
                                prose-blockquote:border-l-primary
                                prose-headings:text-primary-foreground-muted line-clamp-6'
                    dangerouslySetInnerHTML={{ __html: cleanContent }}
                />
            }

        </div>
    )
})
