'use client'

import { createContext, useContext } from 'react'
import { PostsWithAuthorAndCommunity } from '@/complexTypes'

interface PostContextType {
    post: PostsWithAuthorAndCommunity
}

const PostContext = createContext<PostContextType | null>(null)

export function PostProvider({
    children,
    post
}: {
    children: React.ReactNode,
    post: PostsWithAuthorAndCommunity
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