'use client'

import React, { createContext, useContext } from 'react'
import { PostsWithComments } from '@/complexTypes'

interface PostContextType {
    post: PostsWithComments
}

const PostContext = createContext<PostContextType | null>(null)

export function PostProvider({
    children,
    post
}: {
    children: React.ReactNode,
    post: PostsWithComments
}) {
    return (
        <PostContext.Provider value={{ post }}>
            {children}
        </PostContext.Provider>
    )
}

export function usePost() {
    const context = useContext(PostContext)
    if (!context) {
        throw new Error('usePost must be used within a PostProvider')
    }
    return context
}