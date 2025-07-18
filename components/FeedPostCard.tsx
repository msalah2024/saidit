import React, { memo, useState } from 'react'
import {
    Card,
    CardAction,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { BadgeCheck, Ellipsis, Forward, Loader2, MessageCircle, Rows3, Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from 'next/link';
import TextContent from './posts-content-type/textContent';
import { PostsWithAuthorAndCommunity } from '@/complexTypes';
import { deletePost } from '@/app/actions'; // Import removeVote
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
import PostVote from './PostVote';

interface PostCardProps {
    post: PostsWithAuthorAndCommunity
    setItems: React.Dispatch<React.SetStateAction<PostsWithAuthorAndCommunity[]>>;
}

export default memo(function FeedPostCard({ post, setItems }: PostCardProps) {
    const deleteDialogRef = React.useRef<HTMLButtonElement>(null);
    const { user } = useGeneralProfile();
    const { view } = useView()
    const isAuthor = post.author_id === user?.id

    if (view === "Compact") {
        return (
            <Card className='w-full relative py-4 max-w-full my-2 gap-1 bg-saidit-black'>
                <div className='flex w-full gap-2'>
                    <div className='bg-background flex items-center justify-center shrink-0 border rounded-lg w-28 h-20 ml-3 overflow-hidden'>
                        {
                            post.post_type === 'text' || post.post_type === 'link' ?
                                <Rows3 size={24} className='text-muted-foreground' />
                                : post.post_type === 'image' ?
                                    <ImagesContentCompact post={post} />
                                    : null
                        }
                    </div>
                    <div className='max-w-[calc(100%-7rem)] w-full pr-8'>
                        <CardHeader className='px-0'>
                            <div className='flex items-center gap-2'>
                                <CardTitle className='text-primary-foreground-muted flex items-center gap-1'>
                                    <Avatar className='h-6 w-6'>
                                        <AvatarImage src={post.communities.image_url || undefined}
                                            className='rounded-full'
                                            draggable={false}
                                        />
                                        <AvatarFallback>s/</AvatarFallback>
                                    </Avatar>
                                    <Link href={`/s/${post.communities.community_name}`} className='text-sm ml-0.5 hover:underline z-10'>
                                        s/{post.communities.community_name}
                                    </Link>
                                    {
                                        post.communities.verified &&
                                        <BadgeCheck className="text-background" fill="#477ed8" size={18} />
                                    }
                                </CardTitle>
                                <span className='text-muted-foreground'>•</span>
                                <CardDescription className='line-clamp-1'>{formatRelativeTime(post.created_at)}</CardDescription>
                            </div>

                        </CardHeader>
                        <CardContent className='px-0'>
                            {
                                post.post_type === 'text' || post.post_type === 'image' ?
                                    <TextContent post={post} />
                                    : post.post_type === 'link' ?
                                        <LinkContent post={post} />
                                        : null
                            }
                        </CardContent>
                        <CardFooter className='mt-2 pl-0'>
                            <div className='flex items-center gap-2'>
                                <PostVote postId={post.id}
                                    initialVotes={post.posts_votes}
                                />
                                <Link href={`/s/${post.communities.community_name}/comments/${post.slug}`} className='z-10'>
                                    <Button className='p-0 m-0 h-8 rounded-full z-10' variant={'ghost'} asChild>
                                        <div className='flex items-center h-8 px-3 bg-muted text-primary-foreground-muted rounded-full'><MessageCircle size={18} />
                                            <p className='text-sm font-medium leading-0 text-primary-foreground-muted select-none'>{post.comments[0].count}</p>
                                        </div>
                                    </Button>
                                </Link>
                                <CardAction className='z-10 hover:cursor-pointer'>
                                    <DropdownMenu modal={false}>
                                        <DropdownMenuTrigger asChild disabled={!isAuthor}>
                                            <div className='flex items-center gap-1.5 h-8 px-3 bg-muted text-primary-foreground-muted rounded-full'>
                                                <Ellipsis size={18} />
                                            </div>
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
                                            <DropdownMenuItem disabled>
                                                <Forward size={18} /> Share
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </CardAction>
                            </div>
                        </CardFooter>
                    </div>
                </div >
                <ConfirmationDialog triggerRef={deleteDialogRef} setItems={setItems} post={post} />
                <Link
                    href={`/s/${post.communities.community_name}/comments/${post.slug}`}
                    className="absolute inset-0 z-0"
                />
            </Card >

        )
    }

    return (
        <Card className='w-full relative max-w-4xl my-2 gap-1 bg-saidit-black pb-3 pt-4'>
            <CardHeader className='px-4'>
                <div className='flex items-center gap-2'>
                    <CardTitle className='text-primary-foreground-muted flex items-center gap-1'>
                        <Avatar className='h-6 w-6'>
                            <AvatarImage src={post.communities.image_url || undefined}
                                className='rounded-full'
                                draggable={false}
                            />
                            <AvatarFallback>s/</AvatarFallback>
                        </Avatar>
                        <Link href={`/s/${post.communities.community_name}`} className='text-sm ml-0.5 hover:underline z-10'>
                            s/{post.communities.community_name}
                        </Link>
                        {
                            post.communities.verified &&
                            <BadgeCheck className="text-background" fill="#477ed8" size={18} />
                        }
                    </CardTitle>
                    <span className='text-muted-foreground'>•</span>
                    <CardDescription>{formatRelativeTime(post.created_at)}</CardDescription>
                </div>
                <CardAction className='z-10 hover:cursor-pointer'>
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
            <CardContent className='px-4'>
                {
                    post.post_type === 'text' ?
                        <TextContent post={post} />
                        : post.post_type === 'image' ?
                            <div className='mb-2'>
                                <ImagesContent post={post} />
                            </div>
                            : post.post_type === 'link' ?
                                <LinkContent post={post} />
                                : null
                }
            </CardContent>
            <CardFooter className='mt-1 px-4'>
                <div className='flex items-center gap-2'>
                    <PostVote postId={post.id}
                        initialVotes={post.posts_votes}
                    />
                    <Link href={`/s/${post.communities.community_name}/comments/${post.slug}`} className='z-10'>
                        <Button className='p-0 m-0 h-8 rounded-full z-10' variant={'ghost'} asChild>
                            <div className='flex items-center h-8 px-3 bg-muted text-primary-foreground-muted rounded-full'><MessageCircle size={18} />
                                <p className='text-sm font-medium leading-0 text-primary-foreground-muted select-none'>{post.comments[0].count}</p>
                            </div>
                        </Button>
                    </Link>
                    <Button disabled className='p-0 m-0 h-8 rounded-full z-10' variant={'ghost'}>
                        <div className='flex items-center gap-1.5 h-8 px-3 bg-muted text-primary-foreground-muted rounded-full'>
                            <Forward size={18} /> Share
                        </div>
                    </Button>
                </div>
            </CardFooter>
            <ConfirmationDialog triggerRef={deleteDialogRef} setItems={setItems} post={post} />
            <Link
                href={`/s/${post.communities.community_name}/comments/${post.slug}`}
                className="absolute inset-0 z-0"
            />
        </Card>
    )
})


type ConfirmationDialogProps = {
    triggerRef: React.RefObject<HTMLButtonElement | null>;
    setItems: React.Dispatch<React.SetStateAction<PostsWithAuthorAndCommunity[]>>;
    post: PostsWithAuthorAndCommunity
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