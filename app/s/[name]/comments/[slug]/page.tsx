"use client"
import { CommentRefreshProvider } from '@/app/context/CommentRefreshContext'
import Comment from '@/components/Comment'
import React from 'react'

export default function Page() {
    return (
        <div className='overflow-hidden'>
            <CommentRefreshProvider>
                <Comment
                    comment={{
                        id: '1',
                        author: {
                            username: 'user1',
                            avatar_url: null,
                            verified: true,
                        },
                        content: 'This is the main comment',
                        createdAt: '2 days ago',
                        isOP: true,
                    }}
                />
            </CommentRefreshProvider>
        </div>
    )
}
