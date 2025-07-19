"use client"
import { useGeneralProfile } from '@/app/context/GeneralProfileContext'
import React, { useRef, useState, useEffect } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import Link from 'next/link'
import { BadgeCheck, Bell, Bookmark, CircleMinus, CirclePlus, Ellipsis, Forward, MessageCircle, Pencil, Trash2 } from 'lucide-react'
import { Button } from './ui/button'
import LShape from './Lshape'
import { useCommentRefresh } from '@/app/context/CommentRefreshContext';
import ReplyForm from './create-comment-form/reply-form'
import CommentVote from './CommentVote'
import { toast } from 'sonner'
import { formatDistanceToNow } from 'date-fns'
// import { useMediaQuery } from '@/hooks/use-media-query'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { deleteComment, flagCommentAsDeleted } from '@/app/actions'
import EditForm from './create-comment-form/edit-form'


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
}

interface CommentProps {
    comments: NormalizedComment[];
    depth?: number;
    setNormalizedComments: React.Dispatch<React.SetStateAction<NormalizedComment[]>>
}

export default function Comment({ comments, depth = 0, setNormalizedComments }: CommentProps) {
    const avatarRefs = useRef<{ [id: string]: HTMLDivElement | null }>({});
    const commentRefs = useRef<{ [id: string]: HTMLDivElement | null }>({});
    const { profile } = useGeneralProfile()
    const [collapsedMap, setCollapsedMap] = useState<{ [id: string]: boolean }>({});
    const [connectorHeights, setConnectorHeights] = useState<{ [id: string]: number | null }>({});
    const { refreshVersion, triggerRefresh } = useCommentRefresh();
    const [replyingTo, setReplyingTo] = useState<string | null>(null)
    const [editingCommentID, setEditingCommentID] = useState<string | null>(null);
    const { user } = useGeneralProfile()

    // const isDesktop = useMediaQuery("(min-width: 768px)")

    useEffect(() => {
        if (depth > 0) {
            const newHeights: { [id: string]: number | null } = {};
            comments.forEach(comment => {
                const commentElem = commentRefs.current[comment.id];
                const parentComment = commentElem?.closest('.relative')?.parentElement?.previousElementSibling as HTMLElement;
                if (commentElem && parentComment) {
                    const parentRect = parentComment.getBoundingClientRect();
                    const childRect = commentElem.getBoundingClientRect();
                    const heightBetween = childRect.top - parentRect.top;
                    if (heightBetween > 0) {
                        newHeights[comment.id] = heightBetween + 16;
                    } else {
                        newHeights[comment.id] = null;
                    }
                }
            });
            setConnectorHeights(newHeights);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [collapsedMap, depth, refreshVersion, comments.length]);

    const handleCollapse = (id: string) => {
        setCollapsedMap(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
        triggerRefresh();
    }

    const handleAuthDialog = () => {
        window.dispatchEvent(new CustomEvent('openAuthDialog'))
    }

    const handleReplyClick = (commentID: string) => {
        if (user) {
            setReplyingTo(commentID)
            requestAnimationFrame(() => {
                triggerRefresh()
            })
        }

        else {
            toast.error("Please log in to make a reply");
            handleAuthDialog()
        }
    }

    function updateComments(
        comments: NormalizedComment[],
        commentId: string,
        hasReplies: boolean | undefined
    ): NormalizedComment[] {
        return comments.reduce<NormalizedComment[]>((acc, comment) => {
            if (comment.id === commentId) {
                if (hasReplies) {
                    acc.push({ ...comment, deleted: true });
                }
            } else {
                const updatedReplies = comment.replies
                    ? updateComments(comment.replies, commentId, hasReplies)
                    : undefined;

                acc.push({ ...comment, replies: updatedReplies });
            }
            return acc;
        }, []);
    }

    const handleCommentDelete = async (comment: NormalizedComment) => {
        const hasReplies = comment.replies && comment.replies.length > 0;
        const result = hasReplies
            ? await flagCommentAsDeleted(comment.id)
            : await deleteComment(comment.id);

        if (result.success) {
            setNormalizedComments(prev => updateComments(prev, comment.id, hasReplies));
            triggerRefresh()
        } else {
            toast.error("An error occurred");
        }
    }

    return (
        <>
            {comments.map((comment) => {

                const isAuthor = profile?.account_id === comment.creator_id
                const collapsed = collapsedMap[comment.id] || false;

                return (
                    <div
                        key={comment.id}
                        className='relative'
                        ref={el => { commentRefs.current[comment.id] = el; }}
                    >
                        <div className='absolute top-8 left-2 shrink-0 flex h-full flex-col items-center'>

                            {depth !== 0 && connectorHeights[comment.id] && (
                                <div
                                    className='absolute'
                                    style={{
                                        top: `-${connectorHeights[comment.id]! + 15}px`,
                                        left: '-33px',
                                    }}
                                >
                                    <LShape
                                        color='#171b1f'
                                        width={24}
                                        height={connectorHeights[comment.id]!}
                                        thickness={1}
                                    />
                                </div>
                            )}
                        </div>
                        <div className='flex gap-2'>
                            <div
                                ref={el => { avatarRefs.current[comment.id] = el; }}
                                className={`flex flex-col mb-3 items-center ${collapsed ? 'justify-center' : ''}`}
                            >
                                {!collapsed ? (
                                    <Avatar className='h-8 w-8 z-20'>
                                        <AvatarImage
                                            src={(!comment.deleted && comment.author.avatar_url) || undefined}
                                            className='rounded-full'
                                            draggable={false}
                                        />
                                        <AvatarFallback>
                                            {(!comment.deleted && comment.author.username?.slice(0, 2).toUpperCase()) || 'DE'}
                                        </AvatarFallback>
                                    </Avatar>
                                ) : (
                                    <CirclePlus className='text-white hover:cursor-pointer mt-1 ml-2' size={16} onClick={() => handleCollapse(comment.id)} />
                                )}
                            </div>
                            <div className='flex flex-col gap-1 font-medium w-full'>
                                <div className='flex items-center gap-2'>
                                    {
                                        comment.deleted ?
                                            <div className='text-primary-foreground-muted'>
                                                [deleted]
                                            </div>
                                            :
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
                                    }
                                    <span className='text-muted-foreground'>•</span>
                                    <div className='text-sm text-muted-foreground'>
                                        {
                                            formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })
                                        }
                                    </div>
                                </div>
                                {!collapsed && (
                                    <div className='flex flex-col gap-1 w-full'>
                                        {comment.deleted ? <div className='text-primary-foreground-muted'>
                                            [deleted]
                                        </div>
                                            : editingCommentID === comment.id ?
                                                <EditForm commentID={comment.id}
                                                    content={comment.content}
                                                    setShowTipTap={() => setEditingCommentID(null)}
                                                    setNormalizedComments={setNormalizedComments}
                                                />
                                                :
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
                                        }

                                        <div className='flex items-center relative mt-1 mb-2 gap-1'>

                                            <CommentVote commentID={comment.id} initialVotes={comment.comments_votes} deleted={comment.deleted} />
                                            <Button
                                                onClick={() => { handleReplyClick(comment.id) }}
                                                disabled={comment.deleted}
                                                className='p-0 m-0 h-7 text-primary-foreground-muted gap-1 rounded-full z-10 hover:cursor-pointer' variant={'ghost'}>
                                                <MessageCircle size={16} />
                                                Reply
                                            </Button>
                                            <Button
                                                disabled={comment.deleted}
                                                className='p-0 m-0 h-7 text-primary-foreground-muted gap-1 rounded-full z-10 hover:cursor-pointer' variant={'ghost'}>
                                                <Forward size={16} /> Share
                                            </Button>
                                            {
                                                comment.deleted ?
                                                    <Button disabled={comment.deleted} className='p-1 m-0 h-7 gap-1 rounded-full z-10 hover:cursor-pointer' variant={'ghost'}>
                                                        <Ellipsis size={16} />
                                                    </Button>
                                                    :
                                                    <DropdownMenu modal={false}>
                                                        <DropdownMenuTrigger className='p-0 m-0 h-7 gap-1 rounded-full z-10 hover:cursor-pointer'>
                                                            <Button className='p-1 m-0 h-7 gap-1 rounded-full z-10 hover:cursor-pointer' variant={'ghost'} asChild>
                                                                <div className='flex items-center select-none gap-1 h-7 px-3 bg-background text-xs text-primary-foreground-muted rounded-full'>
                                                                    <Ellipsis size={16} />
                                                                </div>
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent>
                                                            <DropdownMenuItem disabled><Bell className='text-primary-foreground' />Follow comment</DropdownMenuItem>
                                                            <DropdownMenuItem disabled><Bookmark className='text-primary-foreground' />Save</DropdownMenuItem>
                                                            {
                                                                isAuthor &&
                                                                <>
                                                                    <DropdownMenuItem onClick={() => setEditingCommentID(comment.id)}><Pencil className='text-primary-foreground' />Edit comment</DropdownMenuItem>
                                                                    <DropdownMenuItem onClick={() => handleCommentDelete(comment)}><Trash2 className='text-primary-foreground' />Delete comment</DropdownMenuItem>
                                                                </>
                                                            }
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                            }

                                            {comment.replies && comment.replies.length > 0 && !collapsed && (
                                                <div className='bg-background z-20 absolute -left-8'>
                                                    <CircleMinus className='text-white shrink-0 hover:cursor-pointer' onClick={() => handleCollapse(comment.id)} size={16} />
                                                </div>
                                            )}
                                        </div>
                                        <div className='mb-3'>
                                            {
                                                replyingTo === comment.id &&
                                                <ReplyForm setShowTipTap={() => setReplyingTo(null)} parentID={comment.id} setNormalizedComments={setNormalizedComments} />
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
                                    setNormalizedComments={setNormalizedComments}
                                />
                            </div>
                        )}
                    </div>
                )
            })}
        </>
    )
}
