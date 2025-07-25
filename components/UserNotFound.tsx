import React from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import errorImage from "@/public/assets/images/error-page-image.svg"

export default function UserNotFound() {
    return (
        <div className='flex flex-col items-center gap-2 justify-center full-height text-center p-6'>
            <Image src={errorImage} alt="Error" width={100} height={100} draggable={false} className="select-none" />
            <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
                Sorry, nobody on Saidit goes by that name.
            </h3>
            <small className="text-sm font-medium leading-none">This account may have been banned or the username is incorrect.</small>
            <Button className='mt-2 w-full max-w-xl rounded-full' asChild>
                <Link href="/">Go Back Home</Link>
            </Button>
        </div>
    )
}
