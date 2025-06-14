"use client"
import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import Logo from "@/public/assets/images/saidit-logo.svg"
import AuthDialog from './AuthDialog'
import ProfileMenu from './ProfileMenu'
import { User } from '@supabase/supabase-js'
import { usePathname } from 'next/navigation'
import CreateProfile from './CreateProfile'
import { SidebarTrigger } from './ui/sidebar'
import SidebarDialog from './SidebarDialog'
import { Button } from './ui/button'
import { Plus } from 'lucide-react'

type Profile = {
    username: string
    avatar_url: string | null
}

interface NavbarProps {
    user: User | null;
    profile: Profile | null;
}

type SidebarDialogContent = {
    title: string,
    description: string
}

export default function Navbar({ user, profile }: NavbarProps) {
    const [openCreateProfile, setOpenCreateProfile] = useState(false)
    const [sidebarDialogOpen, setSidebarDialogOpen] = useState(false)
    const [sidebarDialogContent, setSidebarDialogContent] = useState<SidebarDialogContent>()

    const pathname = usePathname()

    const disabledPaths = ["/protected/reset-password"]

    const shouldDisableNavbar = disabledPaths.some((path) => pathname.startsWith(path))

    useEffect(() => {
        const checkForProfile = user?.app_metadata?.provider === "discord" || user?.app_metadata?.provider === "google"
        if (user && !profile && checkForProfile) {
            setOpenCreateProfile(true)
        }

        const handleSidebarDialog = (e: CustomEvent<SidebarDialogContent>) => {
            setSidebarDialogContent(e.detail)
            setSidebarDialogOpen(true)
        }

        window.addEventListener('openSidebarDialog', handleSidebarDialog as EventListener)
        return () => {
            window.removeEventListener('openSidebarDialog', handleSidebarDialog as EventListener)
        }

    }, [user, profile])

    return (
        <div className='flex items-center bg-background fixed top-0 left-0 right-0 z-50 h-14 border-b justify-between'>
            {shouldDisableNavbar ? (
                <div className='flex items-center text-primary-foreground gap-2 ml-4'>
                    <Image src={Logo} alt='Logo' width={35} height={35} />
                    <h2 className="text-3xl text-primary-foreground font-semibold tracking-tight">
                        saidit
                    </h2>
                </div>
            ) : (
                <div className='ml-4 lg:ml-2 flex items-center gap-4'>
                    <SidebarTrigger variant={'outline'} className='text-primary-foreground hover:bg-reddit-gray p-4' />
                    <Link href="/" className='flex items-center gap-2'>
                        <Image src={Logo} alt='Logo' width={35} height={35} />
                        <h2 className="text-3xl font-semibold tracking-tight">
                            saidit
                        </h2>
                    </Link>
                    <SidebarDialog
                        user={user}
                        open={sidebarDialogOpen}
                        setOpen={setSidebarDialogOpen}
                        dialogContent={sidebarDialogContent} />
                </div>
            )}

            {
                openCreateProfile && (
                    <CreateProfile user={user} />
                )
            }
            {!shouldDisableNavbar && (user ? <div className='flex items-center gap-2'>
                <Button variant={'outline'} size={'icon'} className='rounded-full hover:bg-primary lg:hidden' asChild>
                    <Link href={'/protected/create-post'}>
                        <Plus />
                    </Link>
                </Button>
                <Button variant={'outline'} className='rounded-full hover:bg-primary hidden lg:flex' asChild>
                    <Link href={'/protected/create-post'}>
                        <Plus /> Create Post
                    </Link>
                </Button>
                <ProfileMenu profile={profile} />
            </div> : <AuthDialog />)}
        </div>
    )
}
