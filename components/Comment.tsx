"use client"
import { useGeneralProfile } from '@/app/context/GeneralProfileContext'
import React, { useRef, useState, useEffect } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import Link from 'next/link'
import { BadgeCheck, CircleMinus, CirclePlus, Forward, MessageCircle } from 'lucide-react'
import { Button } from './ui/button'
import LShape from './Lshape'
import { useCommentRefresh } from '@/app/context/CommentRefreshContext';

type CommentType = {
    id: string;
    author: {
        username: string;
        avatar_url: string | null;
        verified: boolean;
    };
    content: string;
    createdAt: string;
    isOP?: boolean;
    replies?: CommentType[];
};

interface CommentProps {
    comment: CommentType;
    depth?: number;
    isLast?: boolean;
}

export default function Comment({ comment, depth = 0 }: CommentProps) {
    const avatarRef = useRef<HTMLDivElement>(null)
    const commentRef = useRef<HTMLDivElement>(null)
    const { profile } = useGeneralProfile()
    const [collapsed, setCollapsed] = useState(false)
    const [connectorHeight, setConnectorHeight] = useState<number | null>(null);
    const { refreshVersion, triggerRefresh } = useCommentRefresh();

    useEffect(() => {
        if (commentRef.current && depth > 0) {
            // This will run for child comments
            const parentComment = commentRef.current.closest('.relative')?.parentElement?.previousElementSibling as HTMLElement;

            if (parentComment) {
                const parentRect = parentComment.getBoundingClientRect();
                const childRect = commentRef.current.getBoundingClientRect();
                const heightBetween = childRect.top - parentRect.top;
                if (heightBetween > 0) {
                    setConnectorHeight(heightBetween + 16);
                }
                console.log(`Height between parent and child (${comment.id}):`, heightBetween);
            }
        }
    }, [collapsed, depth, comment.id, comment, refreshVersion]);

    const handleCollapse = () => {
        setCollapsed(!collapsed);
        triggerRefresh();
    }

    const mockReplies: CommentType[] = [
        {
            id: '2',
            author: {
                username: 'user2',
                avatar_url: null,
                verified: false,
            },
            content: 'This is a reply to the first comment',
            createdAt: '1 day ago',
            replies: [
                {
                    id: '3',
                    author: {
                        username: 'user3',
                        avatar_url: null,
                        verified: true,
                    },
                    content: 'Nested reply here!',
                    createdAt: '12 hours ago',
                },
                {
                    id: '4',
                    author: {
                        username: 'user3',
                        avatar_url: null,
                        verified: true,
                    },
                    content: 'Nested reply here!',
                    createdAt: '12 hours ago',
                    replies: [
                        {
                            id: '22',
                            author: {
                                username: 'user3',
                                avatar_url: null,
                                verified: true,
                            },
                            content: 'Nested reply here!',
                            createdAt: '12 hours ago',
                        },
                        {
                            id: '23',
                            author: {
                                username: 'user3',
                                avatar_url: null,
                                verified: true,
                            },
                            content: 'Nested reply here!',
                            createdAt: '12 hours ago',
                        }
                    ]
                }
            ]
        },
        {
            id: '6',
            author: {
                username: 'user3',
                avatar_url: null,
                verified: true,
            },
            content: 'Nested reply here!',
            createdAt: '12 hours ago',
        },
        {
            id: '12',
            author: {
                username: 'user3',
                avatar_url: null,
                verified: true,
            },
            content: 'Nested reply here!',
            createdAt: '12 hours ago',
        }
    ];

    const replies = comment.replies || (depth === 0 ? mockReplies : []);

    return (
        <div className='relative' ref={commentRef}>
            <div className='absolute top-8 left-2 shrink-0 flex h-full flex-col items-center'>
                {replies.length > 0 && !collapsed && (
                    <div className='bg-background z-20 mt-7'>
                        <CircleMinus className='text-white shrink-0 hover:cursor-pointer' onClick={handleCollapse} size={16} />
                    </div>
                )}
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
                                {comment.author.username.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                    ) : (
                        <CirclePlus className='text-white hover:cursor-pointer mt-1' size={16} onClick={handleCollapse} />
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
                                <p className='text-primary-foreground-muted text-sm'>{comment.content}</p>
                            </div>
                            <div className='flex items-center mt-1 mb-2 gap-1'>
                                <Button className='p-0 m-0 h-7 gap-1 rounded-full z-10 hover:cursor-pointer' variant={'ghost'} asChild>
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
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Recursive rendering of replies */}
            {replies.length > 0 && !collapsed && (
                <div className='ml-10'>
                    {replies.map((reply) => (
                        <Comment
                            key={reply.id}
                            comment={reply}
                            depth={depth + 1}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}
