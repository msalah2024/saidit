"use client"
import React from 'react'
import { Button } from "@/components/ui/button"
import { Camera, Ellipsis, Forward, Mail, Plus } from 'lucide-react'
import { useProfile } from "@/app/context/ProfileContext";
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"


export default function ProfileRightSide() {
    const { profile, isOwner } = useProfile();

    return (
        <div className='w-80 bg-black mt-4 pb-2 rounded-2xl hidden lg:flex lg:flex-col'>
            <div className='flex justify-end h-28 bg-primary rounded-t-2xl'>
                {
                    isOwner && (
                        <Button variant="outline" size="icon" className='self-end m-4 hover:bg-muted rounded-full'>
                            <Camera />
                        </Button>
                    )
                }
            </div>
            <div className='py-2 px-4 gap-2'>
                <div className='space-y-2 border-b pb-2'>
                    <div className={isOwner ? 'space-y-2' : 'flex justify-between'}>
                        <h4 className="scroll-m-20 text-xl tracking-tight ml-1">
                            {profile.username}
                        </h4>
                        {
                            isOwner ? (
                                <Button className='rounded-full bg-muted hover:bg-reddit-gray'>
                                    <Forward /> Share
                                </Button>
                            ) : (
                                <DropdownMenu>
                                    <DropdownMenuTrigger className='rounded-full p-1 bg-muted hover:bg-reddit-gray'><Ellipsis /></DropdownMenuTrigger>
                                    <DropdownMenuContent className='mr-10'>
                                        <DropdownMenuItem><Forward className='text-foreground' />Share</DropdownMenuItem>
                                        <DropdownMenuItem><Mail className='text-foreground' />Send a Message</DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>

                            )
                        }
                    </div>
                    <small className="text-sm border-b font-medium text-muted-foreground leading-none">{"it's never easy"}</small>
                    <div className='grid grid-cols-2 gap-4 mt-3'>
                        <div className='space-y-4'>
                            <div>
                                <p className='leading-7 [&:not(:first-child)]:mt-6'>83</p>
                                <small className="text-sm font-medium text-muted-foreground leading-none">Post karma</small>
                            </div>
                            <div>
                                <p className='leading-7 [&:not(:first-child)]:mt-6'>3</p>
                                <small className="text-sm font-medium text-muted-foreground leading-none">Followers</small>
                            </div>
                        </div>
                        <div className='space-y-4'>
                            <div>
                                <p className='leading-7 [&:not(:first-child)]:mt-6'>876</p>
                                <small className="text-sm font-medium text-muted-foreground leading-none">Comment karma</small>
                            </div>
                            <div>
                                <p className='leading-7 [&:not(:first-child)]:mt-6'>May 21, 2019</p>
                                <small className="text-sm font-medium text-muted-foreground leading-none">Cake day</small>
                            </div>

                        </div>
                    </div>
                </div>
                {
                    isOwner && (
                        <div className='space-y-2 border-b py-2'>
                            <small className="text-sm font-medium text-muted-foreground leading-none">SETTINGS</small>
                            <div className='flex gap-2 items-center justify-between mt-4'>
                                <div className='flex gap-2 items-center'>
                                    <Avatar>
                                        <AvatarImage draggable="false" src={profile.avatar_url || undefined} alt="avatar" />
                                        <AvatarFallback>
                                            {profile.username.slice(0, 2).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className='flex flex-col gap-1'>
                                        <small className="text-sm font-medium leading-none">Profile</small>
                                        <small className="text-sm font-medium text-muted-foreground leading-none">Customize your profile</small>
                                    </div>
                                </div>
                                <Button variant="link" className='rounded-full bg-muted hover:bg-reddit-gray text-foreground'>Update</Button>
                            </div>
                        </div>
                    )
                }
                {
                    isOwner && (
                        <div className='space-y-2 border-b py-2'>
                            <small className="text-sm font-medium text-muted-foreground leading-none">LINKS</small>
                            <div className='mt-4'>
                                <Button variant="link" className='rounded-full bg-muted hover:bg-reddit-gray text-foreground'>
                                    <Plus />
                                    Add social link
                                </Button>
                            </div>
                        </div>
                    )
                }
            </div>
        </div>
    )
}
