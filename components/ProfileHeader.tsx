"use client"
import React from 'react'
import { useProfile } from "@/app/context/ProfileContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

export default function ProfileHeader() {
    const { profile, isOwner } = useProfile();

    return (
        <div className='flex flex-col mt-4 gap-4'>
            <div className='flex items-center gap-4'>
                <Avatar className="w-16 h-16">
                    <AvatarImage draggable={false} src={profile.avatar_url || undefined} />
                    <AvatarFallback>
                        {profile.username.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                </Avatar>
                <div className='flex flex-col'>
                    <h2 className="scroll-m-20 text-3xl font-semibold tracking-tight first:mt-0 text-primary-foreground-muted">
                        {profile.username}
                    </h2>
                    <p className='text-muted-foreground'>u/{profile.username}</p>
                </div>
            </div>
            <div className='my-2 hidden lg:block'>
                <Tabs defaultValue="overview">
                    <TabsList className='h-fit bg-background gap-4 flex-wrap'>
                        <TabsTrigger className='px-3 py-2 text-primary-foreground-muted rounded-full data-[state=active]:bg-reddit-gray data-[state=active]:text-primary-foreground hover:underline hover:text-primary-foreground'
                            value="overview">Overview</TabsTrigger>
                        <TabsTrigger className='px-3 py-2 text-primary-foreground-muted rounded-full data-[state=active]:bg-reddit-gray data-[state=active]:text-primary-foreground hover:underline hover:text-primary-foreground'
                            value="posts">Posts</TabsTrigger>
                        <TabsTrigger className='px-3 py-2 text-primary-foreground-muted rounded-full data-[state=active]:bg-reddit-gray data-[state=active]:text-primary-foreground hover:underline hover:text-primary-foreground'
                            value="comments">Comments</TabsTrigger>
                        {
                            isOwner && (
                                <>
                                    <TabsTrigger className='px-3 py-2 text-primary-foreground-muted rounded-full data-[state=active]:bg-reddit-gray data-[state=active]:text-primary-foreground hover:underline hover:text-primary-foreground'
                                        value="saved">Saved</TabsTrigger>
                                    <TabsTrigger className='px-3 py-2 text-primary-foreground-muted rounded-full data-[state=active]:bg-reddit-gray data-[state=active]:text-primary-foreground hover:underline hover:text-primary-foreground'
                                        value="hidden">Hidden</TabsTrigger>
                                    <TabsTrigger className='px-3 py-2 text-primary-foreground-muted rounded-full data-[state=active]:bg-reddit-gray data-[state=active]:text-primary-foreground hover:underline hover:text-primary-foreground'
                                        value="upvoted">Upvoted</TabsTrigger>
                                    <TabsTrigger className='px-3 py-2 text-primary-foreground-muted rounded-full data-[state=active]:bg-reddit-gray data-[state=active]:text-primary-foreground hover:underline hover:text-primary-foreground'
                                        value="downvoted">Downvoted</TabsTrigger>
                                </>
                            )
                        }

                    </TabsList>
                </Tabs>
            </div>
            <div className='lg:hidden flex my-2'>
                <Select>
                    <SelectTrigger className="w-full data-[placeholder]:text-foreground">
                        <SelectValue placeholder="Overview" defaultValue="overview" defaultChecked />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="overview">Overview</SelectItem>
                        <SelectItem value="posts">Posts</SelectItem>
                        <SelectItem value="comments">Comments</SelectItem>
                        {
                            isOwner && (
                                <>
                                    <SelectItem value="saved">Saved</SelectItem>
                                    <SelectItem value="hidden">Hidden</SelectItem>
                                    <SelectItem value="upvoted">Upvoted</SelectItem>
                                    <SelectItem value="downvoted">Downvoted</SelectItem>
                                </>
                            )
                        }
                    </SelectContent>
                </Select>
            </div>
        </div>

    )
}
