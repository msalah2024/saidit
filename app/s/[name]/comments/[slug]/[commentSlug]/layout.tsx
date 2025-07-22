import { createClient } from '@/utils/supabase/server'
import React from 'react'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default async function Layout({ children, params }: any) {
    const supabase = await createClient()
    const awaitedParams = await params
    const commentSlug = awaitedParams.commentSlug

    const { data, error } = await supabase
        .rpc('fetch_comment_with_replies_by_slug', { slug: commentSlug }).maybeSingle()

    if (error) {
        console.error(error)
    }

    console.log('data', data)


    // if (!post.success || !post.data) {
    //     return (
    //         <PostNotFound />
    //     )
    // }

    return (
        <div>
            {children}
        </div>
    )
}