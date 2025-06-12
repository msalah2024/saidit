import React, { memo, useEffect, useState } from 'react'
import {
    Card,
    CardAction,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { ArrowBigDown, ArrowBigUp, Ellipsis, Forward, Loader2, MessageCircle, Rows3, Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from 'next/link';
import TextContent from './posts-content-type/textContent';
import { PostsWithAuthor } from '@/complexTypes';
import { deletePost, managePostVotes, removeVote } from '@/app/actions'; // Import removeVote
import { useGeneralProfile } from '@/app/context/GeneralProfileContext';
import { toast } from "sonner"
import { useView } from '@/app/context/ViewContext';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { formatRelativeTime } from '@/lib/formatDate';

interface PostCardProps {
    post: PostsWithAuthor
    setItems: React.Dispatch<React.SetStateAction<PostsWithAuthor[]>>;
}

type vote = { vote_type: 'upvote' | 'downvote', voter_id: string | null, id: string }

export default memo(function PostCard({ post, setItems }: PostCardProps) {
    const [votes, setVotes] = useState(0);
    const [userVote, setUserVote] = useState<null | vote>(null);
    const deleteDialogRef = React.useRef<HTMLButtonElement>(null);

    const { user } = useGeneralProfile();
    const { view } = useView()
    const isAuthor = post.author_id === user?.id

    console.log(post)

    useEffect(() => {
        let upVotes = 0;
        let downVotes = 0;
        let currentUserVote: vote | null = null;

        post.posts_votes.forEach((vote) => {
            if (vote.vote_type === 'upvote') upVotes++;
            else downVotes++;
            if (vote.voter_id === user?.id) currentUserVote = vote;
        });

        setVotes(upVotes - downVotes);
        setUserVote(currentUserVote);
    }, [post.posts_votes, user?.id]);

    const handleVote = async (voteType: 'upvote' | 'downvote') => {
        if (!user) {
            toast.error("Please log in to vote");
            return;
        }

        if (userVote && userVote.vote_type === voteType) {
            try {
                const result = await removeVote(userVote.id);
                if (result.success) {
                    setVotes(prev => voteType === 'upvote' ? prev - 1 : prev + 1);
                    setUserVote(null);
                } else {
                    toast.error("Failed to remove vote");
                }
            } catch (error) {
                console.error(error);
                toast.error("Failed to remove vote");
            }
            return;
        }

        try {
            const result = await managePostVotes(user.id, post.id, voteType);
            if (result.success) {
                if (userVote) {
                    setVotes(prev => voteType === 'upvote' ? prev + 2 : prev - 2);
                } else {
                    setVotes(prev => voteType === 'upvote' ? prev + 1 : prev - 1);
                }
                setUserVote({ vote_type: voteType, voter_id: user.id, id: result.data?.id }); // Update with new vote
            } else {
                toast.error("An error occurred");
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to update vote");
        }
    };

    if (view === "Compact") {
        return (
            <Card className='w-full py-4 max-w-full my-2 gap-1 bg-saidit-black'>
                <div className='flex w-full gap-2'>
                    <div className='bg-background flex items-center justify-center border rounded-lg w-28 h-20 ml-3'>
                        <Rows3 size={24} className='text-muted-foreground' />
                    </div>
                    <div className='w-full'>
                        <CardHeader className='pl-0'>
                            <div className='flex items-center gap-2'>
                                <CardTitle className='text-primary-foreground-muted flex items-center gap-1'>
                                    <Avatar className='h-6 w-6'>
                                        <AvatarImage src={post.users?.avatar_url || undefined}
                                            className='rounded-full'
                                            draggable={false}
                                        />
                                        <AvatarFallback>CN</AvatarFallback>
                                    </Avatar>
                                    <Link href={`/u/${post.users?.username}`} className='text-sm hover:underline'>
                                        u/{post.users?.username}
                                    </Link>
                                </CardTitle>
                                <span className='text-muted-foreground'>•</span>
                                <CardDescription>{formatRelativeTime(post.created_at)}</CardDescription>
                            </div>
                            <CardAction>
                                <DropdownMenu modal={false}>
                                    <DropdownMenuTrigger asChild disabled={!isAuthor}>
                                        <div className='p-1.5 hover:bg-reddit-gray rounded-full bg-background hover:cursor-pointer'><Ellipsis size={16} /></div>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className='bg-saidit-black mr-14'>
                                        {
                                            isAuthor &&
                                            <DropdownMenuItem
                                                onClick={() => deleteDialogRef.current?.click()}
                                                className='text-primary-foreground-muted'>
                                                <Trash className='text-primary-foreground-muted' /> Delete
                                            </DropdownMenuItem>
                                        }
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </CardAction>
                        </CardHeader>
                        <CardContent className='pl-0'>
                            <TextContent post={post} />
                        </CardContent>
                        <CardFooter className='mt-2 pl-0'>
                            <div className='flex gap-3'>
                                <div className='flex items-center bg-muted rounded-full'>
                                    <div
                                        onClick={() => {
                                            handleVote("upvote")
                                        }}
                                        className='p-2 rounded-full text-primary-foreground-muted hover:text-primary hover:cursor-pointer text-center'>
                                        <ArrowBigUp size={20} fill={userVote?.vote_type === 'upvote' ? '#5BAE4A' : ''}
                                            className={userVote?.vote_type === 'upvote' ? 'text-primary' : ''} />
                                    </div>
                                    <p className='text-sm font-medium text-primary-foreground-muted select-none'>{votes}</p>
                                    <div
                                        onClick={() => {
                                            handleVote("downvote")
                                        }}
                                        className='p-2 rounded-full text-center text-primary-foreground-muted hover:text-accent hover:cursor-pointer'>
                                        <ArrowBigDown size={20} fill={userVote?.vote_type === 'downvote' ? '#477ed8' : ''}
                                            className={userVote?.vote_type === 'downvote' ? 'text-accent' : ''} />
                                    </div>
                                </div>
                                <Button disabled variant={'ghost'} className='bg-muted rounded-full text-primary-foreground-muted'><MessageCircle /> 0</Button>
                                <Button disabled variant={'ghost'} className='bg-muted rounded-full text-primary-foreground-muted'><Forward /> Share</Button>
                            </div>
                        </CardFooter>
                    </div>
                </div>
                <ConfirmationDialog triggerRef={deleteDialogRef} postID={post.id} setItems={setItems} />
            </Card>

        )
    }

    return (
        <Card className='w-full max-w-4xl my-2 gap-1 bg-saidit-black'>
            <CardHeader>
                <div className='flex items-center gap-2'>
                    <CardTitle className='text-primary-foreground-muted flex items-center gap-1'>
                        <Avatar className='h-6 w-6'>
                            <AvatarImage src={post.users?.avatar_url || undefined}
                                className='rounded-full'
                                draggable={false}
                            />
                            <AvatarFallback>CN</AvatarFallback>
                        </Avatar>
                        <Link href={`/u/${post.users?.username}`} className='text-sm hover:underline'>
                            u/{post.users?.username}
                        </Link>
                    </CardTitle>
                    <span className='text-muted-foreground'>•</span>
                    <CardDescription>{formatRelativeTime(post.created_at)}</CardDescription>
                </div>
                <CardAction>
                    <DropdownMenu modal={false}>
                        <DropdownMenuTrigger asChild disabled={!isAuthor}>
                            <div className='p-1.5 hover:bg-reddit-gray rounded-full bg-background hover:cursor-pointer'><Ellipsis size={16} /></div>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className='bg-saidit-black mr-14'>
                            {
                                isAuthor &&
                                <DropdownMenuItem
                                    onClick={() => deleteDialogRef.current?.click()}
                                    className='text-primary-foreground-muted'>
                                    <Trash className='text-primary-foreground-muted' /> Delete
                                </DropdownMenuItem>
                            }
                        </DropdownMenuContent>
                    </DropdownMenu>
                </CardAction>
            </CardHeader>
            <CardContent>
                <TextContent post={post} />
            </CardContent>
            <CardFooter className='mt-2'>
                <div className='flex gap-3'>
                    <div className='flex items-center bg-muted rounded-full'>
                        <div
                            onClick={() => {
                                handleVote("upvote")
                            }}
                            className='p-2 rounded-full text-primary-foreground-muted hover:text-primary hover:cursor-pointer text-center'>
                            <ArrowBigUp size={20} fill={userVote?.vote_type === 'upvote' ? '#5BAE4A' : ''}
                                className={userVote?.vote_type === 'upvote' ? 'text-primary' : ''} />
                        </div>
                        <p className='text-sm font-medium text-primary-foreground-muted select-none'>{votes}</p>
                        <div
                            onClick={() => {
                                handleVote("downvote")
                            }}
                            className='p-2 rounded-full text-center text-primary-foreground-muted hover:text-accent hover:cursor-pointer'>
                            <ArrowBigDown size={20} fill={userVote?.vote_type === 'downvote' ? '#477ed8' : ''}
                                className={userVote?.vote_type === 'downvote' ? 'text-accent' : ''} />
                        </div>
                    </div>
                    <Button disabled variant={'ghost'} className='bg-muted rounded-full text-primary-foreground-muted'><MessageCircle /> 0</Button>
                    <Button disabled variant={'ghost'} className='bg-muted rounded-full text-primary-foreground-muted'><Forward /> Share</Button>
                </div>
            </CardFooter>
            <ConfirmationDialog triggerRef={deleteDialogRef} postID={post.id} setItems={setItems} />
        </Card>
    )
})


type ConfirmationDialogProps = {
    triggerRef: React.RefObject<HTMLButtonElement | null>;
    postID: string
    setItems: React.Dispatch<React.SetStateAction<PostsWithAuthor[]>>;
};

const ConfirmationDialog = memo(({ triggerRef, postID, setItems }: ConfirmationDialogProps) => {
    const [isDeleting, setIsDeleting] = useState(false)

    const handlePostDelete = async () => {
        try {
            setIsDeleting(true)
            const result = await deletePost(postID)

            if (result.success) {
                setItems(prevItems => prevItems.filter(item => item.id !== postID));
            }

            else {
                toast.error("An error occurred")
            }

        } catch (error) {
            console.error(error)
        } finally {
            setIsDeleting(false)
        }
    }

    return (
        <AlertDialog>
            <AlertDialogTrigger ref={triggerRef}></AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Delete post?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Once you delete this post, it can’t be restored.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Go Back</AlertDialogCancel>
                    <AlertDialogAction onClick={handlePostDelete}>
                        {isDeleting ? <>
                            <Loader2 className="mr-1 h-4 w-4 animate-spin" />Deleting...
                        </> : 'Yes, Delete'}</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
})
ConfirmationDialog.displayName = "ConfirmationDialog";