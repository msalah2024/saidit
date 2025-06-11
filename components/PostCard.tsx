import React, { memo } from 'react'
import {
    Card,
    CardAction,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { ArrowBigDown, ArrowBigUp, Ellipsis, Forward, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from 'next/link';
import TextContent from './posts-content-type/textContent';
import { PostsWithAuthor } from '@/complexTypes';

interface PostCardProps {
    post: PostsWithAuthor
}

export default memo(function PostCard({ post }: PostCardProps) {

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
                    <CardDescription>4 days ago</CardDescription>
                </div>
                <CardAction>
                    <div className='p-1.5 hover:bg-reddit-gray rounded-full bg-background hover:cursor-pointer'><Ellipsis size={16} /></div>
                </CardAction>
            </CardHeader>
            <CardContent>
                <TextContent post={post} />
            </CardContent>
            <CardFooter className='mt-2'>
                <div className='flex gap-3'>
                    <div className='flex items-center bg-muted rounded-full'>
                        <div className='p-2 rounded-full text-primary-foreground-muted hover:text-primary hover:cursor-pointer text-center'>
                            <ArrowBigUp size={20} />
                        </div>
                        <p className='text-sm font-medium text-primary-foreground-muted select-none'>0</p>
                        <div className='p-2 rounded-full text-center text-primary-foreground-muted hover:text-accent hover:cursor-pointer'>
                            <ArrowBigDown size={20} />
                        </div>
                    </div>
                    <Button disabled variant={'ghost'} className='bg-muted rounded-full text-primary-foreground-muted'><MessageCircle /> 0</Button>
                    <Button disabled variant={'ghost'} className='bg-muted rounded-full text-primary-foreground-muted'><Forward /> Share</Button>
                </div>
            </CardFooter>
        </Card>
    )
})
