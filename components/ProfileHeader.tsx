"use client"
import React from 'react'
import { useProfile } from "@/app/context/ProfileContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function ProfileHeader() {
    const { profile } = useProfile();

    return (
        <div className='flex flex-col gap-4 m-4'>
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
            <div className='mt-2'>
                <Tabs defaultValue="overview">
                    <TabsList className='h-fit bg-background gap-4 flex-wrap'>
                        <TabsTrigger className='px-3 py-2 text-primary-foreground-muted rounded-full data-[state=active]:bg-reddit-gray data-[state=active]:text-primary-foreground hover:underline hover:text-primary-foreground'
                            value="overview">Overview</TabsTrigger>
                        <TabsTrigger className='px-3 py-2 text-primary-foreground-muted rounded-full data-[state=active]:bg-reddit-gray data-[state=active]:text-primary-foreground hover:underline hover:text-primary-foreground'
                            value="posts">Posts</TabsTrigger>
                        <TabsTrigger className='px-3 py-2 text-primary-foreground-muted rounded-full data-[state=active]:bg-reddit-gray data-[state=active]:text-primary-foreground hover:underline hover:text-primary-foreground'
                            value="comments">Comments</TabsTrigger>
                        <TabsTrigger className='px-3 py-2 text-primary-foreground-muted rounded-full data-[state=active]:bg-reddit-gray data-[state=active]:text-primary-foreground hover:underline hover:text-primary-foreground'
                            value="saved">Saved</TabsTrigger>
                        <TabsTrigger className='px-3 py-2 text-primary-foreground-muted rounded-full data-[state=active]:bg-reddit-gray data-[state=active]:text-primary-foreground hover:underline hover:text-primary-foreground'
                            value="hidden">Hidden</TabsTrigger>
                        <TabsTrigger className='px-3 py-2 text-primary-foreground-muted rounded-full data-[state=active]:bg-reddit-gray data-[state=active]:text-primary-foreground hover:underline hover:text-primary-foreground'
                            value="upvoted">Upvoted</TabsTrigger>
                        <TabsTrigger className='px-3 py-2 text-primary-foreground-muted rounded-full data-[state=active]:bg-reddit-gray data-[state=active]:text-primary-foreground hover:underline hover:text-primary-foreground'
                            value="downvoted">Downvoted</TabsTrigger>
                    </TabsList>
                    <TabsContent value="account">Make changes to your account here.</TabsContent>
                    <TabsContent value="password">Change your password here.</TabsContent>
                </Tabs>

            </div>
        </div>

    )
}
