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
import { useGeneralProfile } from '@/app/context/GeneralProfileContext';
import text from './posts-content-type/textContent';
import TextContent from './posts-content-type/textContent';
import ImagesContent from './posts-content-type/imagesContent';
import VideoContent from './posts-content-type/videoContent';
import LinkContent from './posts-content-type/linkContent';

export default memo(function PostCard() {
    const { profile } = useGeneralProfile()

    return (
        <Card className='w-full max-w-4xl gap-1 bg-saidit-black'>
            <CardHeader>
                <div className='flex items-center gap-2'>
                    <CardTitle className='text-primary-foreground-muted flex items-center gap-1'>
                        <Avatar className='h-6 w-6'>
                            <AvatarImage src="https://github.com/shadcn.png"
                                className='rounded-full'
                                draggable={false}
                            />
                            <AvatarFallback>CN</AvatarFallback>
                        </Avatar>
                        <Link href={`/u/${profile?.username}`} className='text-sm hover:underline'>
                            u/{profile?.username}
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
                {/* <TextContent post={post} /> */}
                {/* <ImagesContent image={post.images[0]} /> */}
                {/* <VideoContent /> */}
                <LinkContent />
            </CardContent>
            <CardFooter className='mt-2'>
                <div className='flex gap-3'>
                    <div className='flex items-center bg-muted rounded-full'>
                        <div className='p-2 rounded-full text-primary-foreground-muted hover:text-primary hover:cursor-pointer text-center'>
                            <ArrowBigUp size={20} />
                        </div>
                        <p className='text-sm font-medium text-primary-foreground-muted select-none'>55</p>
                        <div className='p-2 rounded-full text-center text-primary-foreground-muted hover:text-accent hover:cursor-pointer'>
                            <ArrowBigDown size={20} />
                        </div>
                    </div>
                    <Button variant={'ghost'} className='bg-muted rounded-full text-primary-foreground-muted'><MessageCircle /> 8</Button>
                    <Button variant={'ghost'} className='bg-muted rounded-full text-primary-foreground-muted'><Forward /> Share</Button>
                </div>
            </CardFooter>
        </Card>
    )
})
