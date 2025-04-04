"use client"
import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import Logo from "@/public/assets/images/saidit-logo.svg"
import AuthDialog from './AuthDialog'
import ProfileMenu from './ProfileMenu'
import { User } from '@supabase/supabase-js'
import { usePathname } from 'next/navigation'


type Profile = {
    username: string
    avatar_url: string | null
}

interface NavbarProps {
    user: User | null;
    profile: Profile | null;
}

export default function Navbar({ user, profile }: NavbarProps) {
    const pathname = usePathname()

    const disabledPaths = ["/protected/reset-password"]

    const shouldDisableNavbar = disabledPaths.some((path) => pathname.startsWith(path))

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
                <Link href="/home" className='flex items-center gap-2 ml-4'>
                    <Image src={Logo} alt='Logo' width={35} height={35} />
                    <h2 className="text-3xl font-semibold tracking-tight">
                        saidit
                    </h2>
                </Link>
            )}

            {!shouldDisableNavbar && (user ? <ProfileMenu profile={profile} /> : <AuthDialog />)}
        </div>
    )
}
