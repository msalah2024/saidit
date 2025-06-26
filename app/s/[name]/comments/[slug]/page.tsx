"use client"
import Comment from '@/components/Comment'
import React from 'react'

export default function Page() {
    return (
        <div>
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
        </div>
    )
}
