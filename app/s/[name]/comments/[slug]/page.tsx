"use client"
import { CommentRefreshProvider } from '@/app/context/CommentRefreshContext'
import { usePost } from '@/app/context/PostContext'
import Comment from '@/components/Comment'
import CommentForm from '@/components/create-comment-form/comment-form'
import React, { useState, useMemo } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { CommentWithAuthor } from '@/complexTypes'
import { useGeneralProfile } from '@/app/context/GeneralProfileContext'
import { toast } from 'sonner'

interface NormalizedComment {
    id: string;
    author: {
        username: string | null;
        avatar_url: string | null;
        verified: boolean;
    };
    content: string;
    createdAt: string;
    replies?: NormalizedComment[];
    isOP?: boolean;
    comments_votes: { vote_type: 'upvote' | 'downvote', voter_id: string | null, id: string }[]
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
            content: comment.body || '',
            createdAt: formatDistanceToNow(new Date(comment.created_at), { addSuffix: true }),
            isOP: comment.creator_id === authorId,
            comments_votes: comment.comments_votes || []
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
    const [showTipTap, setShowTipTap] = useState(false)
    const { post } = usePost()
    const { user } = useGeneralProfile()

    const handleAuthDialog = () => {
        window.dispatchEvent(new CustomEvent('openAuthDialog'))
    }

    const normalizedComments = useMemo(() => {
        return normalizeComments(post.comments || [], post.author_id || "");
    }, [post.comments, post.author_id]);

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
                        <CommentForm setShowTipTap={setShowTipTap} />
                    }
                </div>
                <Comment comments={normalizedComments} />
            </CommentRefreshProvider>
        </div>
    )
}
