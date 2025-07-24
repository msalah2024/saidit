"use client"
import { createClient } from '@/utils/supabase/client'
import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { useGeneralProfile } from '@/app/context/GeneralProfileContext';
import Comment from '@/components/Comment'
import PulseLogo from '@/components/PulseLogo';
import Image from 'next/image';
import saiditLogo from '@/public/assets/images/saidit-face.svg'
import Link from 'next/link';
import { usePost } from '@/app/context/PostContext';

interface NormalizedComment {
    id: string;
    author: {
        username: string | null;
        avatar_url: string | null;
        verified: boolean;
    };
    creator_id: string | null,
    content: string;
    createdAt: string;
    replies?: NormalizedComment[];
    isOP?: boolean;
    comments_votes: { vote_type: 'upvote' | 'downvote', voter_id: string | null, id: string }[]
    deleted: boolean
    slug: string
}

export default function Page() {
    const supabase = createClient()
    const { profile } = useGeneralProfile()
    const { post } = usePost()
    const [isLoading, setIsLoading] = useState(false)
    const [hasFetched, setHasFetched] = useState(false)
    const [comments, setComments] = useState<NormalizedComment[]>([])
    const params = useParams()
    const commentSlug = params.commentSlug as string

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const normalizeComment = (commentData: any): NormalizedComment => {
        return {
            id: commentData.id,
            slug: commentData.slug,
            author: {
                username: commentData.author?.username || null,
                avatar_url: commentData.author?.avatar_url || null,
                verified: commentData.author?.verified || false
            },
            creator_id: commentData.creator_id || null,
            content: commentData.content,
            createdAt: commentData.createdAt,
            deleted: commentData.deleted || false,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            comments_votes: commentData.comments_votes?.map((vote: any) => ({
                id: vote.id,
                voter_id: vote.voter_id || null,
                vote_type: vote.vote_type
            })) || [],
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            replies: commentData.replies?.map((reply: any) => normalizeComment(reply)) || [],
            isOP: commentData.creator_id === profile?.account_id
        }
    }

    useEffect(() => {
        const loadComments = async () => {
            setIsLoading(true)
            const { data, error } = await supabase
                .rpc('fetch_comment_with_replies_by_slug', { slug: commentSlug })
                .maybeSingle()

            if (error) {
                console.error(error)
                setIsLoading(false)
                return
            }

            if (data) {
                const normalizedComment = normalizeComment(data)
                setComments([normalizedComment])
            }

            setIsLoading(false)
            setHasFetched(true)
        }

        loadComments()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [commentSlug])


    console.log(comments)

    return (
        <div className='mb-10'>
            <div className='flex justify-between items-center mb-5 mt-2'>
                <p className='text-muted-foreground text-sm shrink-0'>Single comment thread</p>
                <hr className='w-full mx-2' />
                <Link href={`https://www.saidit.app/s/${post.communities.community_name}/comments/${post.slug}`}
                    className='text-primary text-sm hover:underline shrink-0'>See full discussion</Link>
            </div>
            {isLoading &&
                <div className="flex justify-center py-8">
                    <PulseLogo />
                </div>
            }
            {
                !isLoading && comments.length > 0 && (
                    <Comment comments={comments} setNormalizedComments={setComments} />
                )
            }
            {
                !isLoading && hasFetched && comments.length === 0 && (
                    <div className='flex flex-col gap-1 p-2 w-full items-center text-center'>
                        <Image src={saiditLogo} width={60} height={60} alt='saidit logo' draggable={false} />
                        <h3 className="scroll-m-20 text-2xl mt-3 font-semibold tracking-tight select-none">
                            Comment not found
                        </h3>
                        <p className='text-muted-foreground select-none'>
                            We couldn&apos;t find the comment you&apos;re looking for. It may have been deleted or the link might be incorrect.
                        </p>
                    </div>
                )
            }
        </div>
    )
}
