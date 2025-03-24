import React from 'react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { LogOut, Settings, UserPen } from 'lucide-react'
import { type User } from '@supabase/supabase-js'
import { createClient } from '@/utils/supabase/server'
import { SignOut } from '@/app/actions'

export default async function ProfileMenu({ user }: { user: User | null }) {
    const supabase = await createClient()

    const { data: profile } = await supabase.from('users').select("username, avatar_url").eq("email", user?.email).single()

    return (
        <DropdownMenu>
            <DropdownMenuTrigger className='hover:bg-muted p-2 rounded-full mr-2'>
                <Avatar >
                    <AvatarImage src={profile?.avatar_url} />
                    <AvatarFallback>SI</AvatarFallback>
                </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent className='mr-2 mt-2'>
                <DropdownMenuItem className='py-4 focus:bg-card mr-10'>
                    <Avatar className='size-10'>
                        <AvatarImage src={profile?.avatar_url} />
                        <AvatarFallback>hh</AvatarFallback>
                    </Avatar>
                    <div>
                        <p>View Profile</p>
                        <small className="text-sm text-muted-foreground font-medium leading-none">u/{profile?.username}</small>
                    </div>
                </DropdownMenuItem>
                <DropdownMenuItem className='py-2 focus:bg-card mr-10'><UserPen className='text-foreground' /> Edit Avatar</DropdownMenuItem>
                <DropdownMenuItem className='py-2 focus:bg-card mr-10'><Settings className='text-foreground' /> Settings</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className='py-2 focus:bg-card mr-10' onClick={SignOut}><LogOut className='text-foreground' />Log Out</DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
