"use client"
import { CommentRefreshProvider } from '@/app/context/CommentRefreshContext'
import { usePost } from '@/app/context/PostContext'
import Comment from '@/components/Comment'
import CommentForm from '@/components/create-comment-form/comment-form'
import React, { useState } from 'react'

export default function Page() {
    const [showTipTap, setShowTipTap] = useState(false)
    const { post } = usePost()
    return (
        <div className='overflow-hidden'>
            <CommentRefreshProvider>
                <div className='mb-6 mt-1'>
                    {
                        !showTipTap &&
                        <div onClick={() => { setShowTipTap(true) }} className='p-3 rounded-3xl hover:cursor-text border bg-saidit-black'>
                            <p className='text-sm pl-1'>Join the conversation</p>
                        </div>
                    }
                    {
                        showTipTap &&
                        <CommentForm setShowTipTap={setShowTipTap} />
                    }
                </div>
                {/* <Comment
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
                /> */}
            </CommentRefreshProvider>
        </div>
    )
}
