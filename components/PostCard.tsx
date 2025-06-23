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
import { ArrowBigDown, ArrowBigUp, BadgeCheck, Ellipsis, Forward, Loader2, MessageCircle, Rows3, Trash } from 'lucide-react';
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
import ImagesContent from './posts-content-type/imagesContent';
import { createClient } from '@/utils/supabase/client';
import ImagesContentCompact from './posts-content-type/imagesContentCompact';
import LinkContent from './posts-content-type/linkContent';

interface PostCardProps {
    post: PostsWithAuthor
    setItems: React.Dispatch<React.SetStateAction<PostsWithAuthor[]>>;
}

type vote = { vote_type: 'upvote' | 'downvote', voter_id: string | null, id: string }

export default memo(function PostCard({ post, setItems }: PostCardProps) {
    const [votes, setVotes] = useState(0);
    const [userVote, setUserVote] = useState<null | vote>(null);
    const deleteDialogRef = React.useRef<HTMLButtonElement>(null);

    const { user, profile } = useGeneralProfile();
    const { view } = useView()
    const isAuthor = post.author_id === user?.id

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

        const previousVotes = votes;
        const previousUserVote = userVote;

        let newVotes = votes;
        let newUserVote: vote | null = null;

        if (userVote && userVote.vote_type === voteType) {
            newVotes = voteType === 'upvote' ? votes - 1 : votes + 1;
            newUserVote = null;
        } else if (userVote) {
            newVotes = voteType === 'upvote' ? votes + 2 : votes - 2;
            newUserVote = { ...userVote, vote_type: voteType };
        } else {
            newVotes = voteType === 'upvote' ? votes + 1 : votes - 1;
            newUserVote = { vote_type: voteType, voter_id: user.id, id: "pending" };
        }

        setVotes(newVotes);
        setUserVote(newUserVote);

        try {
            const result = await managePostVotes(user.id, post.id, voteType);

            if (!result.success) {
                throw new Error(result.message);
            }

            if (newUserVote === null) {
                if (userVote?.id && userVote.id !== "pending") {
                    await removeVote(userVote.id);
                }
            }

            if (result.data?.id && newUserVote?.id === "pending") {
                setUserVote({
                    vote_type: voteType,
                    voter_id: user.id,
                    id: result.data.id
                });
            }
        } catch (error) {
            setVotes(previousVotes);
            setUserVote(previousUserVote);
            toast.error("Failed to update vote");
            console.error("Vote error:", error);
        }
    };

    if (view === "Compact") {
        return (
            <Card className='w-full py-4 max-w-full my-2 gap-1 bg-saidit-black'>
                <div className='flex w-full gap-2'>
                    <div className='bg-background flex items-center justify-center border rounded-lg w-28 h-20 ml-3 overflow-hidden'>
                        {
                            post.post_type === 'text' || post.post_type === 'link' ?
                                <Rows3 size={24} className='text-muted-foreground' />
                                : post.post_type === 'image' ?
                                    <ImagesContentCompact post={post} />
                                    : null
                        }
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
                                    {
                                        profile?.verified &&
                                        <BadgeCheck className="text-background" fill="#5BAE4A" size={18} />
                                    }
                                </CardTitle>
                                <span className='text-muted-foreground'>•</span>
                                <CardDescription className='line-clamp-1'>{formatRelativeTime(post.created_at)}</CardDescription>
                            </div>
                            <CardAction>
                                <DropdownMenu modal={false}>
                                    <DropdownMenuTrigger asChild disabled={!isAuthor}>
                                        <div className='p-1.5 hover:bg-reddit-gray rounded-full bg-background hover:cursor-pointer'><Ellipsis size={16} /></div>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className='mr-6 lg:mr-18'>
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
                            {
                                post.post_type === 'text' || post.post_type === 'image' ?
                                    <TextContent post={post} />
                                    : post.post_type === 'link' ?
                                        <LinkContent post={post} /> : null
                            }
                        </CardContent>
                        <CardFooter className='mt-2 pl-0'>
                            <div className='flex items-center gap-2'>
                                <div className='flex items-center h-8 bg-muted rounded-full'>
                                    <div
                                        onClick={() => {
                                            handleVote("upvote")
                                        }}
                                        className='p-2 rounded-full text-primary-foreground-muted hover:text-primary hover:cursor-pointer text-center'>
                                        <ArrowBigUp size={18} fill={userVote?.vote_type === 'upvote' ? '#5BAE4A' : ''}
                                            className={userVote?.vote_type === 'upvote' ? 'text-primary' : ''} />
                                    </div>
                                    <p className='text-sm font-medium leading-0 text-primary-foreground-muted select-none'>{votes}</p>
                                    <div
                                        onClick={() => {
                                            handleVote("downvote")
                                        }}
                                        className='p-2 rounded-full text-center text-primary-foreground-muted hover:text-accent hover:cursor-pointer'>
                                        <ArrowBigDown size={18} fill={userVote?.vote_type === 'downvote' ? '#477ed8' : ''}
                                            className={userVote?.vote_type === 'downvote' ? 'text-accent' : ''} />
                                    </div>
                                </div>
                                <Button disabled className='p-0 m-0 h-8 rounded-full' variant={'ghost'}>
                                    <div className='flex items-center gap-1.5 h-8 px-3 bg-muted text-primary-foreground-muted rounded-full'><MessageCircle size={18} />
                                        <p className='text-sm font-medium leading-0 text-primary-foreground-muted select-none'>0</p>
                                    </div>
                                </Button>
                                <Button disabled className='p-0 m-0 h-8 rounded-full' variant={'ghost'}>
                                    <div className='flex items-center gap-1.5 h-8 px-3 bg-muted text-primary-foreground-muted rounded-full'>
                                        <Forward size={18} /> Share
                                    </div>
                                </Button>
                            </div>
                        </CardFooter>
                    </div>
                </div>
                <ConfirmationDialog triggerRef={deleteDialogRef} setItems={setItems} post={post} />
            </Card>

        )
    }

    return (
        <Card className='w-full max-w-4xl my-2 gap-1 bg-saidit-black py-5'>
            <CardHeader className='px-5'>
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
                        {
                            profile?.verified &&
                            <BadgeCheck className="text-background" fill="#5BAE4A" size={18} />
                        }
                    </CardTitle>
                    <span className='text-muted-foreground'>•</span>
                    <CardDescription>{formatRelativeTime(post.created_at)}</CardDescription>
                </div>
                <CardAction>
                    <DropdownMenu modal={false}>
                        <DropdownMenuTrigger asChild disabled={!isAuthor}>
                            <div className='p-1.5 hover:bg-reddit-gray rounded-full bg-background hover:cursor-pointer'><Ellipsis size={16} /></div>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className='mr-6 lg:mr-18'>
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
            <CardContent className='px-5'>
                {
                    post.post_type === 'text' ?
                        <TextContent post={post} />
                        : post.post_type === 'image' ?
                            <ImagesContent post={post} />
                            : post.post_type === 'link' ?
                                <LinkContent post={post} /> :
                                null
                }
            </CardContent>
            <CardFooter className='mt-2 px-5'>
                <div className='flex items-center gap-2'>
                    <div className='flex items-center h-8 bg-muted rounded-full'>
                        <div
                            onClick={() => {
                                handleVote("upvote")
                            }}
                            className='p-2 rounded-full text-primary-foreground-muted hover:text-primary hover:cursor-pointer text-center'>
                            <ArrowBigUp size={18} fill={userVote?.vote_type === 'upvote' ? '#5BAE4A' : ''}
                                className={userVote?.vote_type === 'upvote' ? 'text-primary' : ''} />
                        </div>
                        <p className='text-sm font-medium leading-0 text-primary-foreground-muted select-none'>{votes}</p>
                        <div
                            onClick={() => {
                                handleVote("downvote")
                            }}
                            className='p-2 rounded-full text-center text-primary-foreground-muted hover:text-accent hover:cursor-pointer'>
                            <ArrowBigDown size={18} fill={userVote?.vote_type === 'downvote' ? '#477ed8' : ''}
                                className={userVote?.vote_type === 'downvote' ? 'text-accent' : ''} />
                        </div>
                    </div>
                    <Button disabled className='p-0 m-0 h-8 rounded-full' variant={'ghost'}>
                        <div className='flex items-center gap-1.5 h-8 px-3 bg-muted text-primary-foreground-muted rounded-full'><MessageCircle size={18} />
                            <p className='text-sm font-medium leading-0 text-primary-foreground-muted select-none'>0</p>
                        </div>
                    </Button>
                    <Button disabled className='p-0 m-0 h-8 rounded-full' variant={'ghost'}>
                        <div className='flex items-center gap-1.5 h-8 px-3 bg-muted text-primary-foreground-muted rounded-full'>
                            <Forward size={18} /> Share
                        </div>
                    </Button>
                </div>
            </CardFooter>
            <ConfirmationDialog triggerRef={deleteDialogRef} setItems={setItems} post={post} />
        </Card>
    )
})


type ConfirmationDialogProps = {
    triggerRef: React.RefObject<HTMLButtonElement | null>;
    setItems: React.Dispatch<React.SetStateAction<PostsWithAuthor[]>>;
    post: PostsWithAuthor
};

const ConfirmationDialog = memo(({ triggerRef, post, setItems }: ConfirmationDialogProps) => {
    const [isDeleting, setIsDeleting] = useState(false)
    const supabase = createClient()

    const handlePostDelete = async () => {
        try {
            setIsDeleting(true)

            switch (post.post_type) {
                case 'text':
                    const textResult = await deletePost(post.id)
                    if (textResult.success) {
                        setItems(prevItems => prevItems.filter(item => item.id !== post.id));
                    }
                    else {
                        toast.error("An error occurred")
                    }

                    break;

                case 'image':
                    const imageResult = await deletePost(post.id)
                    if (imageResult.success) {
                        const oldImages = post.post_attachments

                        for (const image of oldImages) {
                            const clippedAvatarUrl = image.file_url.split('saidit/')[1];

                            const { error: removeError } = await supabase
                                .storage
                                .from('saidit')
                                .remove([clippedAvatarUrl])

                            if (removeError) {
                                console.error("Image delete error", removeError.message)
                                toast.error(removeError.message)
                                return
                            }
                        }
                        setItems(prevItems => prevItems.filter(item => item.id !== post.id));
                    }
                    break;

                case 'link':
                    const linkResult = await deletePost(post.id)
                    if (linkResult.success) {
                        setItems(prevItems => prevItems.filter(item => item.id !== post.id));
                    }
                    else {
                        toast.error("An error occurred")
                    }
                    break;

                default:
                    break;
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