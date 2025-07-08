import { fetchPostBySlug } from '@/app/actions';
import { PostProvider } from '@/app/context/PostContext';
import PostBackButton from '@/components/PostBackButton';
import PostHeader from '@/components/PostHeader';
import PostNotFound from '@/components/PostNotFound';
import React from 'react'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default async function Layout({ children, params }: any) {
    const awaitedParams = await params
    const slug = awaitedParams.slug

    const post = await fetchPostBySlug(slug)

    if (!post.success || !post.data) {
        return (
            <PostNotFound />
        )
    }

    return (
        <div className='flex gap-4'>
            <PostProvider post={post.data}>
                <div className='hidden lg:flex'>
                    <PostBackButton />
                </div>
                <div className='flex flex-col gap-4 w-full'>
                    <PostHeader />
                    {children}
                </div>
            </PostProvider>
        </div>
    )
}