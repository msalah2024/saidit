"use client"
import { CommentRefreshProvider } from '@/app/context/CommentRefreshContext'
import { usePost } from '@/app/context/PostContext'
import Comment from '@/components/Comment'
import CommentForm from '@/components/create-comment-form/comment-form'
import React, { useState, useEffect } from 'react'
import { CommentWithAuthor } from '@/complexTypes'
import { useGeneralProfile } from '@/app/context/GeneralProfileContext'
import { toast } from 'sonner'
import SortComments from '@/components/SortComments'
import PulseLogo from '@/components/PulseLogo'
import { fetchCommentSorted } from '@/app/actions'
import { useSearchParams } from 'next/navigation'
import Image from 'next/image';
import saiditLogo from '@/public/assets/images/saidit-face.svg'

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

function normalizeComments(comments: CommentWithAuthor[], authorId: string): NormalizedComment[] {
    const commentMap = new Map<string, NormalizedComment>();
    const rootComments: NormalizedComment[] = [];

    // First pass: create all comment nodes
    comments.forEach(comment => {
        const normalized: NormalizedComment = {
            id: comment.id,
            author: {
                username: comment.users?.username || null,
                avatar_url: comment.users?.avatar_url || null,
                verified: comment.users?.verified || false,
            },
            creator_id: comment.creator_id,
            content: comment.body || '',
            createdAt: comment.created_at,
            isOP: comment.creator_id === authorId,
            comments_votes: comment.comments_votes || [],
            deleted: comment.deleted,
            slug: comment.slug
        };

        commentMap.set(comment.id, normalized);
    });

    // Second pass: build the hierarchy
    comments.forEach(comment => {
        const normalized = commentMap.get(comment.id);
        if (!normalized) return;

        if (comment.parent_id) {
            const parent = commentMap.get(comment.parent_id);
            if (parent) {
                if (!parent.replies) {
                    parent.replies = [];
                }
                parent.replies.push(normalized);
            }
        } else {
            rootComments.push(normalized);
        }
    });
    return rootComments;
}

export default function Page() {
    const searchParams = useSearchParams()
    const sortParam = searchParams.get('sortCommentBy')
    const initialSortBy = (sortParam === 'best' || sortParam === 'new' || sortParam === 'old' || sortParam === 'controversial')
        ? sortParam
        : 'best'

    const [showTipTap, setShowTipTap] = useState(false)
    const { post } = usePost()
    const { user } = useGeneralProfile()
    const [sortBy, setSortBy] = useState<'best' | 'new' | 'old' | 'controversial'>(initialSortBy)
    const [comments, setComments] = useState<CommentWithAuthor[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [hasFetched, setHasFetched] = useState(false)
    const [normalizedComments, setNormalizedComments] = useState<NormalizedComment[]>([])

    useEffect(() => {
        const loadComments = async () => {
            setIsLoading(true)
            const result = await fetchCommentSorted(sortBy, post.id)
            if (result && result.success) {
                setComments(result.data)
            } else {
                toast.error("Failed to load comments")
            }
            setIsLoading(false)
        }

        loadComments()
    }, [sortBy, post.id])

    useEffect(() => {
        if (comments.length === 0 && !hasFetched) { setHasFetched(true); return };
        setNormalizedComments(normalizeComments(comments, post.author_id || ""));
        setHasFetched(true);
    }, [comments, post.author_id, hasFetched]);

    const handleAuthDialog = () => {
        window.dispatchEvent(new CustomEvent('openAuthDialog'))
    }

    const handleEditorClick = () => {
        if (user) {
            setShowTipTap(true)
        }
        else {
            toast.error("Please log in to make a comment");
            handleAuthDialog()
        }
    }

    return (
        <div className='overflow-hidden'>
            <CommentRefreshProvider>
                <div className='mb-6 mt-1'>
                    {
                        !showTipTap &&
                        <div onClick={() => { handleEditorClick() }} className='p-3 rounded-3xl hover:cursor-text hover:bg-[#0e1216] border bg-saidit-black'>
                            <p className='text-sm pl-1'>Join the conversation</p>
                        </div>
                    }
                    {
                        showTipTap &&
                        <CommentForm setShowTipTap={setShowTipTap} setNormalizedComments={setNormalizedComments} />
                    }
                    <SortComments sortBy={sortBy} setSortBy={setSortBy} />
                </div>
                {isLoading &&
                    <div className="flex justify-center py-8">
                        <PulseLogo />
                    </div>
                }
                {
                    !isLoading && hasFetched && normalizedComments.length === 0 && (
                        <div className='flex flex-col gap-1 p-2 w-full items-center text-center'>
                            <Image src={saiditLogo} width={60} height={60} alt='saidit logo' draggable={false} />
                            <h3 className="scroll-m-20 text-2xl mt-3 font-semibold tracking-tight select-none">
                                Be the first to comment
                            </h3>
                            <p className='text-muted-foreground select-none'>
                                Nobody&#39;s responded to this post yet. Add your thoughts and get the conversation going.
                            </p>
                        </div>
                    )
                }
                {
                    !isLoading && normalizedComments.length > 0 && (
                        <Comment comments={normalizedComments} setNormalizedComments={setNormalizedComments} />
                    )
                }
            </CommentRefreshProvider>
        </div>
    )
}

