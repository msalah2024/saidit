"use client"
import React, { useState } from 'react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { LogOut, Settings, UserPen } from 'lucide-react'
import { SignOut } from '@/app/actions'
import { useRouter } from 'nextjs-toploader/app'
import { useMediaQuery } from '@/hooks/use-media-query'
import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer"


type Profile = {
    username: string
    avatar_url: string | null
}

export default function ProfileMenu({ profile }: { profile: Profile | null }) {
    const router = useRouter()
    const isDesktop = useMediaQuery("(min-width: 768px)")
    const [open, setOpen] = useState(false)

    if (isDesktop) {
        return (
            <DropdownMenu>
                <DropdownMenuTrigger className='hover:bg-muted p-2 rounded-full mr-2 select-none'>
                    <Avatar>
                        <AvatarImage src={profile?.avatar_url || undefined} className='rounded-full aspect-square' draggable={false} />
                        <AvatarFallback>
                            {profile?.username.slice(0, 2).toUpperCase() || "SI"}
                        </AvatarFallback>
                    </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent className='mr-2 mt-2'>
                    <DropdownMenuItem onClick={() => router.push(`/u/${profile?.username}`)} className='py-4 focus:bg-reddit-gray/25 w-full mr-10'>
                        <Avatar className='size-10'>
                            <AvatarImage src={profile?.avatar_url || undefined} className='rounded-full' draggable={false} />
                            <AvatarFallback>SI</AvatarFallback>
                        </Avatar>
                        <div>
                            <p>View Profile</p>
                            <small className="text-sm text-muted-foreground font-medium leading-none">u/{profile?.username}</small>
                        </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push('/protected/settings/profile')} className='py-2 focus:bg-reddit-gray/25 mr-10 w-full'><UserPen className='text-foreground' /> Edit Avatar</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push('/protected/settings/account')} className='py-2 focus:bg-reddit-gray/25 mr-10 w-full'>
                        <Settings className='text-foreground' /> Settings</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className='py-2 focus:bg-reddit-gray/25 mr-10 w-full' onClick={SignOut}>
                        <LogOut className='text-foreground' />Log Out</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        )
    }

    return (
        <Drawer open={open} onOpenChange={setOpen}>
            <DrawerTrigger className='hover:bg-muted p-2 rounded-full mr-2 select-none'>
                <Avatar>
                    <AvatarImage src={profile?.avatar_url || undefined} className='rounded-full aspect-square' draggable={false} />
                    <AvatarFallback>
                        {profile?.username.slice(0, 2).toUpperCase() || "SI"}
                    </AvatarFallback>
                </Avatar>
            </DrawerTrigger>
            <DrawerContent >
                <DrawerHeader className='px-3'>
                    <DrawerTitle>
                        <div className='flex items-center mt-2 rounded-2xl bg-black p-4 gap-2 w-full' onClick={() => {
                            setOpen(false)
                            router.push(`/u/${profile?.username}`)
                        }}>
                            <Avatar className='size-10'>
                                <AvatarImage src={profile?.avatar_url || undefined} className='rounded-full' draggable={false} />
                                <AvatarFallback>SI</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className='text-primary-foreground-muted'>View Profile</p>
                                <small className="text-sm text-muted-foreground font-medium leading-none">u/{profile?.username}</small>
                            </div>
                        </div>
                    </DrawerTitle>
                </DrawerHeader>
                <div className='flex flex-col mb-4 gap-1 text-primary-foreground-muted border-t pt-2'>
                    <div onClick={() => {
                        setOpen(false)
                        router.push('/protected/settings/profile')
                    }}
                        className='flex items-center px-6 py-3 gap-4 w-full justify-start'>
                        <UserPen /> Edit Avatar
                    </div>
                    <div onClick={() => {
                        setOpen(false)
                        router.push('/protected/settings/account')
                    }}
                        className='flex items-center px-6 py-3 gap-4 w-full justify-start'>
                        <Settings /> Settings
                    </div>
                    <div onClick={SignOut}
                        className='flex items-center px-6 py-3 gap-4 w-full justify-start'>
                        <LogOut />Log Out
                    </div>
                </div>
            </DrawerContent>
        </Drawer>

    )

}
