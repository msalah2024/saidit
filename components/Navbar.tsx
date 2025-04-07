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

type Profile = {
    username: string
    avatar_url: string | null
}

interface NavbarProps {
    user: User | null;
    profile: Profile | null;
}

export default function Navbar({ user, profile }: NavbarProps) {
    const [openCreateProfile, setOpenCreateProfile] = useState(false)

    const pathname = usePathname()

    const disabledPaths = ["/protected/reset-password"]

    const shouldDisableNavbar = disabledPaths.some((path) => pathname.startsWith(path))

    console.log("user", user)

    useEffect(() => {
        const checkForProfile = user?.app_metadata?.provider === "discord" || user?.app_metadata?.provider === "google"
        if (user && !profile && checkForProfile) {
            setOpenCreateProfile(true)
        }

    }, [user, profile])

    return (
        <div className='flex items-center h-14 border-b justify-between'>
            {shouldDisableNavbar ? (
                <div className='flex items-center gap-2 ml-4'>
                    <Image src={Logo} alt='Logo' width={35} height={35} />
                    <h2 className="text-3xl font-semibold tracking-tight">
                        saidit
                    </h2>
                </div>
            ) : (
                <Link href="/" className='flex items-center gap-2 ml-4'>
                    <Image src={Logo} alt='Logo' width={35} height={35} />
                    <h2 className="text-3xl font-semibold tracking-tight">
                        saidit
                    </h2>
                </Link>
            )}
            {
                openCreateProfile && (
                    <CreateProfile user={user} />
                )
            }
            {!shouldDisableNavbar && (user ? <ProfileMenu profile={profile} /> : <AuthDialog />)}
        </div>
    )
}
