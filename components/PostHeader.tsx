"use client"
import { usePost } from '@/app/context/PostContext'
import React, { memo, useState } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { BadgeCheck, Bookmark, Ellipsis, Forward, Loader2, MessageCircle, Trash } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { formatRelativeTime } from '@/lib/formatDate'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu'
import { useGeneralProfile } from '@/app/context/GeneralProfileContext'
import PostVote from './PostVote'
import { Button } from './ui/button'
import PostBackButton from './PostBackButton'
import { useParams } from 'next/navigation'
import { useRouter } from 'nextjs-toploader/app'
import { createClient } from '@/utils/supabase/client'
import { toast } from 'sonner'
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
import { deletePost, flagPostDeleted } from '@/app/actions'
import { PostsWithAuthorAndCommunity } from '@/complexTypes'

const TextContentComments = dynamic(
    () => import('./posts-content-type/textContentComments'),
    { ssr: false }
)
const ImagesContent = dynamic(
    () => import('./posts-content-type/imagesContent'),
    { ssr: false }
)
const LinkContent = dynamic(
    () => import('./posts-content-type/linkContent'),
    { ssr: false }
)

export default function PostHeader() {
    const { post } = usePost()
    const { user } = useGeneralProfile()
    const isAuthor = post.author_id === user?.id
    const params = useParams()
    const router = useRouter()

    const deleteDialogRef = React.useRef<HTMLButtonElement>(null);

    const isSingleThreadPage = params.commentSlug !== undefined && params.commentSlug !== null

    const postContent = () => {
        switch (post.post_type) {
            case 'text':
                return (
                    <div className='-ml-2'>
                        <TextContentComments post={post} />
                    </div>
                )
            case 'image':
                return (
                    <ImagesContent post={post} />
                )
            case 'link':
                return (
                    <div className='-ml-2'>
                        <LinkContent post={post} />
                    </div>
                )
            default:
                return null
        }
    }

    const handleCommentClick = () => {
        if (isSingleThreadPage) {
            router.push(`/s/${post.communities.community_name}/comments/${post.slug}?openEditor=true`);
        }

        else {
            window.dispatchEvent(new CustomEvent('showTipTap', { detail: true }));
        }
    }

    return (
        <div className='flex flex-col gap-2 w-full'>
            <div className='flex justify-between items-center'>
                <div className='flex gap-1 font-medium'>
                    <div className='lg:hidden flex mr-2'>
                        <PostBackButton />
                    </div>
                    <Avatar className='h-9 w-9'>
                        <AvatarImage src={post.communities.image_url || undefined}
                            className='rounded-full'
                            draggable={false}
                        />
                        <AvatarFallback>s/</AvatarFallback>
                    </Avatar>
                    <div className='flex flex-col'>
                        <div className='flex items-center gap-1'>
                            <div className='flex items-center gap-1 ml-1'>
                                <Link href={`/s/${post.communities.community_name}`} className='text-sm hover:underline z-10'>
                                    s/{post.communities?.community_name}
                                </Link>
                                {
                                    post.communities.verified &&
                                    <BadgeCheck className="text-background" fill="#477ed8" size={18} />
                                }
                            </div>
                            <span className='text-muted-foreground'>•</span>
                            <div className='text-sm text-muted-foreground font-medium'>{formatRelativeTime(post.created_at)}</div>
                        </div>
                        {
                            post.deleted ?
                                <p className='text-sm select-none'>[deleted]</p>
                                :
                                <Link href={`/u/${post.users?.username}`} className='text-sm font-medium text-primary-foreground-muted ml-1 hover:underline'>
                                    {post.users?.username}
                                </Link>
                        }
                    </div>
                </div>
                <div>
                    <DropdownMenu modal={false}>
                        <DropdownMenuTrigger asChild>
                            <div className='p-1.5 hover:bg-reddit-gray rounded-full bg-background hover:cursor-pointer'><Ellipsis size={16} /></div>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className='mr-6 lg:mr-18'>
                            {
                                isAuthor && !post.deleted &&
                                <DropdownMenuItem
                                    onClick={() => deleteDialogRef.current?.click()}
                                    className='text-primary-foreground-muted'>
                                    <Trash className='text-primary-foreground-muted' /> Delete
                                </DropdownMenuItem>
                            }
                            <DropdownMenuItem
                                disabled
                                className='text-primary-foreground-muted'>
                                <Bookmark className='text-primary-foreground-muted' /> Save
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
            {
                post.deleted ?
                    <div>
                        <h3 className="scroll-m-20 select-none text-2xl font-semibold tracking-tight">
                            [deleted]
                        </h3>
                    </div>
                    :
                    postContent()
            }
            <ConfirmationDialog triggerRef={deleteDialogRef} post={post} />
            <div className='flex items-center gap-2 mt-3'>
                <PostVote postId={post.id}
                    initialVotes={post.posts_votes}
                    deleted={post.deleted}
                />
                <Button disabled={post.deleted} onClick={handleCommentClick} className='p-0 m-0 h-8 rounded-full z-10 hover:cursor-pointer' variant={'ghost'}>
                    <div className='flex items-center h-8 px-3 bg-muted text-primary-foreground-muted rounded-full gap-1.5'><MessageCircle size={18} />
                        <p className='text-sm font-medium leading-0 text-primary-foreground-muted select-none'>{post.comments[0].count}</p>
                    </div>
                </Button>
                <Button disabled className='p-0 m-0 h-8 rounded-full z-10' variant={'ghost'}>
                    <div className='flex items-center gap-1.5 h-8 px-3 bg-muted text-primary-foreground-muted rounded-full'>
                        <Forward size={18} /> Share
                    </div>
                </Button>
            </div>
        </div>
    )
}

type ConfirmationDialogProps = {
    triggerRef: React.RefObject<HTMLButtonElement | null>;
    post: PostsWithAuthorAndCommunity
};

const ConfirmationDialog = memo(({ triggerRef, post }: ConfirmationDialogProps) => {
    const [isDeleting, setIsDeleting] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    const handlePostDelete = async () => {
        try {
            setIsDeleting(true)

            if (post.comments[0].count > 0) {
                const result = await flagPostDeleted(post.id)
                if (result.success) {
                    router.refresh()
                    return
                }
                else {
                    toast.error("An error occurred")
                    return
                }
            }

            switch (post.post_type) {
                case 'text':
                    const textResult = await deletePost(post.id)
                    if (textResult.success) {
                        router.push(`/s/${post.communities.community_name}`)
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
                        router.push(`/s/${post.communities.community_name}`)
                    }
                    break;

                case 'link':
                    const linkResult = await deletePost(post.id)
                    if (linkResult.success) {
                        router.push(`/s/${post.communities.community_name}`)
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