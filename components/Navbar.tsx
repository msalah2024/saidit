import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import Logo from "@/public/assets/images/saidit-logo.svg"
import AuthDialog from './AuthDialog'
import ProfileMenu from './ProfileMenu'
import { createClient } from '@/utils/supabase/server'

export default async function Navbar() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    return (
        <div className='flex items-center h-14 border-b justify-between'>
            <Link href={"/home"} className='flex items-center gap-2 ml-4'>
                <Image src={Logo} alt='Logo' width={35} height={35} />
                <h2 className="text-3xl font-semibold tracking-tight">
                    saidit
                </h2>
            </Link>
            {user ? (<ProfileMenu user={user} />) : (<AuthDialog />)}
        </div>
    )
}
