import React from 'react'
import Image from 'next/image'
import resetPasswordImage from "@/public/assets/images/reset-password-image.png"
import { Button } from "@/components/ui/button"

interface CheckYourEmailStepProps {
    isResending: boolean
    countDown: number
    setResend: React.Dispatch<React.SetStateAction<boolean>>
}

export default function CheckYourEmailStep({ isResending, countDown, setResend }: CheckYourEmailStepProps) {
    return (
        <div className='flex flex-col items-center justify-center'>
            <Image src={resetPasswordImage} alt='reset-password-image' width={250} height={250} draggable={false} />
            <p className="leading-7 [&:not(:first-child)]:mt-6 text-sm text-muted-foreground">
                Didn&#39;t get an email? <Button variant="link" disabled={isResending || countDown > 0} onClick={() => setResend(true)} className='text-foreground p-1'>
                    {
                        countDown > 0 ? `Resend (${countDown}s)` : "Resend"
                    }</Button>
            </p>
        </div>
    )
}
