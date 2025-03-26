import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import resetPasswordImage from "@/public/assets/images/reset-password-image.png"

export default function CheckYourEmailStep() {
    return (
        <div className='flex flex-col items-center justify-center'>
            <Image src={resetPasswordImage} alt='reset-password-image' width={250} height={250} draggable={false} />
            <p className="leading-7 [&:not(:first-child)]:mt-6 text-sm text-muted-foreground">
                Didn&#39;t get an email? <Link href={"#"} className='hover:underline text-foreground ml-1'>Resend</Link>
            </p>
        </div>
    )
}
