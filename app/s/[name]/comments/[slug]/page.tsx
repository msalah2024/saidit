"use client"
import { usePost } from '@/app/context/PostContext'
import Comment from '@/components/Comment'
import CommentForm from '@/components/create-comment-form/comment-form'
import React, { useState, useEffect } from 'react'
import { CommentWithAuthor, FlatComment, NormalizedComment } from '@/complexTypes'
import { useGeneralProfile } from '@/app/context/GeneralProfileContext'
import { toast } from 'sonner'
import SortComments from '@/components/SortComments'
import PulseLogo from '@/components/PulseLogo'
import { fetchCommentSorted } from '@/app/actions'
import { useSearchParams } from 'next/navigation'
import Image from 'next/image';
import saiditLogo from '@/public/assets/images/saidit-face.svg'
import saiditErrorLogo from '@/public/assets/images/error-page-image.svg'
import SearchComments from '@/components/SearchComments'
import { useMediaQuery } from '@/hooks/use-media-query'
import MobileComments from '@/components/MobileComments'

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
            stripped_content: comment.stripped_body || '',
            createdAt: comment.created_at,
            updatedAt: comment.updated_at,
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
            } else {
                rootComments.push(normalized);
            }
        } else {
            rootComments.push(normalized);
        }
    });
    return rootComments;
}

function remapToFlatReplies(comments: NormalizedComment[]): NormalizedComment[] {
    function flattenReplies(
        parent: NormalizedComment,
        replies: NormalizedComment[],
        flatMap: FlatComment[]
    ) {
        for (const reply of replies) {
            const flatReply: FlatComment = { ...reply, replyingTo: parent, replies: [] }
            flatMap.push(flatReply)

            if (reply.replies && reply.replies.length > 0) {
                flattenReplies(reply, reply.replies, flatMap)
            }
        }
    }

    return comments.map(comment => {
        const flatReplies: FlatComment[] = []
        if (comment.replies && comment.replies.length > 0) {
            flattenReplies(comment, comment.replies, flatReplies)
        }

        return {
            ...comment,
            replies: flatReplies
        }
    })
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
    const [hasSearched, setHasSearched] = useState(false);
    const [normalizedComments, setNormalizedComments] = useState<NormalizedComment[]>([])
    const [searchTerm, setSearchTerm] = useState('');
    const [flatComments, setFlatComments] = useState<FlatComment[]>([])

    const isDesktop = useMediaQuery("(min-width: 768px)")

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

    useEffect(() => {
        if (!isDesktop) {
            setFlatComments(remapToFlatReplies(normalizedComments))
        }
    }, [normalizedComments, isDesktop])

    useEffect(() => {
        const handleShowTipTap = (e: CustomEvent) => {
            setShowTipTap(e.detail);
        };

        window.addEventListener('showTipTap', handleShowTipTap as EventListener);

        return () => {
            window.removeEventListener('showTipTap', handleShowTipTap as EventListener);
        };
    }, []);

    useEffect(() => {
        const shouldOpenEditor = searchParams.get('openEditor') === 'true';
        if (shouldOpenEditor) {
            setShowTipTap(true);

            const cleanUrl = new URL(window.location.href);
            cleanUrl.searchParams.delete('openEditor');
            window.history.replaceState({}, '', cleanUrl.toString());
        }

        const handleOpenEditor = () => setShowTipTap(true);
        window.addEventListener('openCommentEditor', handleOpenEditor);

        return () => {
            window.removeEventListener('openCommentEditor', handleOpenEditor);
        };
    }, [searchParams]);

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
        <div className='overflow-hidden mb-10'>
            <div className='mb-6 mt-1'>
                {
                    !showTipTap && !post.deleted &&
                    <div onClick={() => { handleEditorClick() }} className='p-3 rounded-3xl hover:cursor-text hover:bg-[#0e1216] border bg-saidit-black'>
                        <p className='text-sm pl-1'>Join the conversation</p>
                    </div>
                }
                {
                    showTipTap &&
                    <CommentForm setShowTipTap={setShowTipTap} showTipTap={showTipTap} setNormalizedComments={setNormalizedComments} />
                }
                <div className='flex items-center flex-wrap gap-x-2 w-full'>
                    <SortComments sortBy={sortBy} setSortBy={setSortBy} disabled={normalizedComments.length === 0} />
                    <SearchComments
                        setComments={setComments}
                        setIsLoading={setIsLoading}
                        setHasSearched={setHasSearched}
                        disableInput={!isLoading && hasFetched && !hasSearched && normalizedComments.length === 0}
                        sortBy={sortBy}
                        searchTerm={searchTerm}
                        setSearchTerm={setSearchTerm}
                    />
                </div>
            </div>
            {isLoading &&
                <div className="flex justify-center py-8">
                    <PulseLogo />
                </div>
            }
            {
                !isLoading && hasFetched && normalizedComments.length === 0 && comments.length === 0 && !hasSearched && (
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
                !isLoading && hasSearched && normalizedComments.length === 0 && (
                    <div className='flex flex-col gap-1 p-2 w-full items-center text-center'>
                        <Image src={saiditErrorLogo} width={60} height={60} alt='saidit logo' draggable={false} />
                        <h3 className="scroll-m-20 text-2xl mt-3 font-semibold tracking-tight select-none">
                            No matching comments
                        </h3>
                        <p className='text-muted-foreground select-none'>
                            Try a different keyword. Couldn’t find any comments matching your search.
                        </p>
                    </div>
                )
            }
            {
                !isLoading && normalizedComments.length > 0 && isDesktop ? (
                    <Comment comments={normalizedComments} setNormalizedComments={setNormalizedComments} searchTerm={searchTerm} hasSearched={hasSearched} />
                ) : !isLoading && normalizedComments.length > 0 && (
                    <MobileComments comments={flatComments} setNormalizedComments={setNormalizedComments} searchTerm={searchTerm} hasSearched={hasSearched} />
                )
            }
        </div>
    )
}

