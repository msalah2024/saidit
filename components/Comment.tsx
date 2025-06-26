
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
    size = 64,          // Overall container size
    verticalLength = 64, // Height of vertical part
    horizontalLength = 64, // Width of horizontal part
    thickness = 4,      // Uniform thickness for both parts
    color = "blue-500",
    className = "",
}) => {
    return (
        <svg
            width={size}
            height={size}
            viewBox={`0 0 ${size} ${size}`}
            className={`text-${color} ${className}`}
        >
            {/* Vertical part (anchored to bottom) */}
            <rect
                x="0"
                y={size - verticalLength}
                width={thickness}
                height={verticalLength}
                fill="currentColor"
            />

            {/* Horizontal part (anchored to left) */}
            <rect
                x="0"
                y={size - thickness}
                width={horizontalLength}
                height={thickness}
                fill="currentColor"
            />
        </svg>
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
                        <div className='absolute h-[calc(100%-6.5rem)] top-8 flex items-center flex-col'>
                            <div className="w-px bg-white h-[calc(100%-4rem)]"></div>
                            <CirclePlus className='text-white shrink-0' size={16} />
                        </div>
                    )}
                    {/* <div className='absolute h-[calc(100%-6rem)] top-8 flex items-center flex-col'>
                        <div className="w-px bg-white h-[calc(100%-4rem)]"></div>
                        <CirclePlus className='text-white shrink-0' size={16} />
                    </div> */}
                    {
                        depth !== 0 &&
                        <div className='absolute -left-[1.55rem] -top-12'>
                            <LShape color='white' thickness={1} horizontalLength={22} verticalLength={45} />
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
                    <div className='flex items-center mt-1 mb-2 gap-2'>
                        <Button className='p-0 m-0 h-7 gap-1 rounded-full hover:cursor-pointer' variant={'ghost'} asChild>
                            <div className='flex items-center select-none h-7 text-xs px-3 bg-muted text-primary-foreground-muted rounded-full'>
                                <MessageCircle size={16} />
                                Reply
                            </div>
                        </Button>
                        <Button className='p-0 m-0 h-7 gap-1 rounded-full hover:cursor-pointer' variant={'ghost'} asChild>
                            <div className='flex items-center select-none gap-1 h-7 px-3 bg-muted text-xs text-primary-foreground-muted rounded-full'>
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
