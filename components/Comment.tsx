
"use client"
import { useGeneralProfile } from '@/app/context/GeneralProfileContext'
import React from 'react'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import Link from 'next/link'
import { BadgeCheck, CirclePlus, Forward, MessageCircle } from 'lucide-react'
import { Button } from './ui/button'

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
}


const LShape = ({
    verticalLength = 64, // Height of vertical part
    horizontalLength = 64, // Width of horizontal part
    thickness = 1,      // Border thickness
    color = "white",    // Border color
    className = "",
    cornerRadius = 15,   // Radius for the rounded corner
}) => {
    return (
        <div
            className={`relative ${className}`}
            style={{
                width: `${horizontalLength}px`,
                height: `${verticalLength}px`,
            }}
        >
            {/* Vertical line */}
            <div
                className="absolute left-0 top-0"
                style={{
                    width: `${thickness}px`,
                    height: `calc(100% - ${cornerRadius}px)`,
                    backgroundColor: color,
                }}
            />

            {/* Horizontal line with rounded corner */}
            <div
                className="absolute bottom-0 left-3"
                style={{
                    width: `calc(100% - ${cornerRadius}px)`,
                    height: `${thickness}px`,
                    backgroundColor: color,
                    // borderBottomLeftRadius: `${cornerRadius}px`,
                }}
            />

            {/* Corner rounding element */}
            <div
                className="absolute bottom-0 left-0"
                style={{
                    width: `${cornerRadius}px`,
                    height: `${cornerRadius}px`,
                    borderBottomLeftRadius: `${cornerRadius}px`,
                    borderLeft: `${thickness}px solid ${color}`,
                    borderBottom: `${thickness}px solid ${color}`,
                }}
            />
        </div>
    );
};

export default function Comment({ comment, depth = 0 }: CommentProps) {
    const { profile } = useGeneralProfile()

    // Mock data - in a real app this would come from props or API
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
                    replies: [
                        {
                            id: '15',
                            author: {
                                username: 'user3',
                                avatar_url: null,
                                verified: true,
                            },
                            content: 'Nested reply here!',
                            createdAt: '12 hours ago',
                        }
                        ,
                        {
                            id: '16',
                            author: {
                                username: 'user3',
                                avatar_url: null,
                                verified: true,
                            },
                            content: 'Nested reply here!',
                            createdAt: '12 hours ago',
                        }
                        ,
                        {
                            id: '17',
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
                ,
                {
                    id: '7',
                    author: {
                        username: 'user3',
                        avatar_url: null,
                        verified: true,
                    },
                    content: 'Nested reply here!',
                    createdAt: '12 hours ago',
                }
                ,
                {
                    id: '9',
                    author: {
                        username: 'user3',
                        avatar_url: null,
                        verified: true,
                    },
                    content: 'Nested reply here!',
                    createdAt: '12 hours ago',
                }
            ]
        },
        {
            id: '4',
            author: {
                username: 'user4',
                avatar_url: null,
                verified: false,
            },
            content: 'Another reply to the original comment',
            createdAt: '5 hours ago',
        }
        ,
        {
            id: '12',
            author: {
                username: 'user4',
                avatar_url: null,
                verified: false,
            },
            content: 'Another reply to the original comment',
            createdAt: '5 hours ago',
        }
    ];

    // Use actual replies if provided, otherwise use mock data for demonstration
    const replies = comment.replies || (depth === 0 ? mockReplies : []);

    return (
        <div className='relative my-3'>
            <div className='flex gap-2'>
                <div className='flex flex-col items-center'>
                    <Avatar className='h-8 w-8'>
                        <AvatarImage
                            src={comment.author.avatar_url || profile?.avatar_url || undefined}
                            className='rounded-full'
                            draggable={false}
                        />
                        <AvatarFallback>
                            {comment.author.username.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    {replies.length > 0 && (
                        <div className='absolute h-[calc(100%-5rem)] top-8 flex items-center flex-col'>
                            <div className="w-px bg-muted h-[calc(100%-4rem)]"></div>
                        </div>
                    )}

                    {replies.length > 0 && (
                        <CirclePlus className='text-white z-10 absolute top-15 shrink-0' size={16} />
                    )}
                    {
                        depth !== 0 &&
                        <div className='absolute -left-[1.55rem] -top-7'>
                            <LShape color='#171b1f' thickness={1} horizontalLength={28} verticalLength={43} />
                        </div>
                    }
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
            </div>

            {/* Recursive rendering of replies */}
            {replies.length > 0 && (
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
