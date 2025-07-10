"use client"
import { useGeneralProfile } from '@/app/context/GeneralProfileContext'
import React, { useRef, useState, useEffect } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import Link from 'next/link'
import { BadgeCheck, CircleMinus, CirclePlus, Forward, MessageCircle } from 'lucide-react'
import { Button } from './ui/button'
import LShape from './Lshape'
import { useCommentRefresh } from '@/app/context/CommentRefreshContext';
import ReplyForm from './create-comment-form/reply-form'
import CommentVote from './CommentVote'
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

interface CommentProps {
    comments: NormalizedComment[];
    depth?: number;
}

export default function Comment({ comments, depth = 0 }: CommentProps) {
    const avatarRef = useRef<HTMLDivElement>(null)
    const commentRef = useRef<HTMLDivElement>(null)
    const { profile } = useGeneralProfile()
    const [collapsedMap, setCollapsedMap] = useState<{ [id: string]: boolean }>({});
    const [connectorHeight, setConnectorHeight] = useState<number | null>(null);
    const { refreshVersion, triggerRefresh } = useCommentRefresh();
    const [replyingTo, setReplyingTo] = useState<string | null>(null)
    const { user } = useGeneralProfile()

    useEffect(() => {
        if (commentRef.current && depth > 0) {
            const parentComment = commentRef.current.closest('.relative')?.parentElement?.previousElementSibling as HTMLElement;

            if (parentComment) {
                const parentRect = parentComment.getBoundingClientRect();
                const childRect = commentRef.current.getBoundingClientRect();
                const heightBetween = childRect.top - parentRect.top;
                if (heightBetween > 0) {
                    setConnectorHeight(heightBetween + 16);
                }
            }
        }
    }, [collapsedMap, depth, refreshVersion]);

    const handleCollapse = (id: string) => {
        setCollapsedMap(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
        triggerRefresh();
    }

    if (comments.length === 0) {
        return null;
    }

    const handleAuthDialog = () => {
        window.dispatchEvent(new CustomEvent('openAuthDialog'))
    }

    const handleReplyClick = (commentID: string) => {
        if (user) {
            setReplyingTo(commentID)
        }

        else {
            toast.error("Please log in to make a reply");
            handleAuthDialog()
        }
    }

    return (
        <>
            {comments.map((comment) => {
                // Use per-comment collapsed state
                const collapsed = collapsedMap[comment.id] || false;
                return (
                    <div key={comment.id} className='relative' ref={commentRef}>
                        <div className='absolute top-8 left-2 shrink-0 flex h-full flex-col items-center'>

                            {depth !== 0 && connectorHeight && (
                                <div
                                    className='absolute'
                                    style={{
                                        top: `-${connectorHeight + 15}px`,
                                        left: '-33px',
                                    }}
                                >
                                    <LShape
                                        color='#171b1f'
                                        width={24}
                                        height={connectorHeight}
                                        thickness={1}
                                    />
                                </div>
                            )}
                        </div>
                        <div className='flex gap-2'>
                            <div ref={avatarRef} className={`flex flex-col mb-3 items-center ${collapsed ? 'justify-center' : ''}`}>
                                {!collapsed ? (
                                    <Avatar className='h-8 w-8 z-20'>
                                        <AvatarImage
                                            src={comment.author.avatar_url || profile?.avatar_url || undefined}
                                            className='rounded-full'
                                            draggable={false}
                                        />
                                        <AvatarFallback>
                                            {comment.author.username?.slice(0, 2).toUpperCase() || ''}
                                        </AvatarFallback>
                                    </Avatar>
                                ) : (
                                    <CirclePlus className='text-white hover:cursor-pointer mt-1' size={16} onClick={() => handleCollapse(comment.id)} />
                                )}
                            </div>
                            <div className='flex flex-col gap-1 font-medium w-full'>
                                <div className='flex items-center gap-2'>
                                    <div className='text-primary-foreground-muted flex items-center gap-1'>
                                        <Link href={`/u/${comment.author.username}`} className='text-sm hover:underline z-10'>
                                            u/{comment.author.username}
                                        </Link>
                                        {comment.author.verified && (
                                            <BadgeCheck className="text-background" fill="#5BAE4A" size={18} />
                                        )}
                                        {comment.isOP && (
                                            <p className='text-sm text-secondary'>OP</p>
                                        )}
                                    </div>
                                    <span className='text-muted-foreground'>•</span>
                                    <div className='text-sm text-muted-foreground'>{comment.createdAt}</div>
                                </div>
                                {!collapsed && (
                                    <div className='flex flex-col gap-1 w-full'>
                                        <div>
                                            <div
                                                className='prose prose-sm prose-invert
                                                text-primary-foreground-muted  
                                                prose-strong:text-primary-foreground-muted
                                                prose-code:text-primary-foreground-muted
                                                prose-li:p:my-0
                                                prose-p:my-0
                                                prose-code:mb-1
                                                prose-code:pb-1
                                                prose-blockquote:p:text-primary-foreground-muted
                                                prose-blockquote:border-l-primary
                                                prose-headings:text-primary-foreground-muted'
                                                dangerouslySetInnerHTML={{ __html: comment.content }}
                                            >
                                            </div>
                                        </div>
                                        <div className='flex items-center relative mt-1 mb-2 gap-1'>
                                            <CommentVote commentID={comment.id} initialVotes={comment.comments_votes} />
                                            <Button
                                                onClick={() => { handleReplyClick(comment.id) }}
                                                className='p-0 m-0 h-7 gap-1 rounded-full z-10 hover:cursor-pointer' variant={'ghost'} asChild>
                                                <div className='flex items-center select-none h-7 text-xs px-3 bg-background text-primary-foreground-muted rounded-full'>
                                                    <MessageCircle size={16} />
                                                    Reply
                                                </div>
                                            </Button>
                                            <Button className='p-0 m-0 h-7 gap-1 rounded-full z-10 hover:cursor-pointer' variant={'ghost'} asChild>
                                                <div className='flex items-center select-none gap-1 h-7 px-3 bg-background text-xs text-primary-foreground-muted rounded-full'>
                                                    <Forward size={16} /> Share
                                                </div>
                                            </Button>
                                            {comment.replies && comment.replies.length > 0 && !collapsed && (
                                                <div className='bg-background z-20 absolute -left-8'>
                                                    <CircleMinus className='text-white shrink-0 hover:cursor-pointer' onClick={() => handleCollapse(comment.id)} size={16} />
                                                </div>
                                            )}
                                        </div>
                                        <div className='mb-3'>
                                            {
                                                replyingTo === comment.id &&
                                                <ReplyForm setShowTipTap={() => setReplyingTo(null)} parentID={comment.id} />
                                            }
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Recursive rendering of replies */}
                        {comment.replies && comment.replies.length > 0 && !collapsed && (
                            <div className='ml-10'>
                                <Comment
                                    comments={comment.replies}
                                    depth={depth + 1}
                                />
                            </div>
                        )}
                    </div>
                )
            })}
        </>
    )
}
