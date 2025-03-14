import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import Logo from "@/public/assets/images/saidit-logo.svg"
import AuthDialog from './AuthDialog'

export default function Navbar() {
    return (
        <div className='flex items-center h-14 border-b px-4 justify-between'>
            <Link href={"/home"} className='flex items-center gap-2'>
                <Image src={Logo} alt='Logo' width={35} height={35} />
                <h2 className="text-3xl font-semibold tracking-tight">
                    saidit
                </h2>
            </Link>
            <AuthDialog />
        </div>
    )
}
