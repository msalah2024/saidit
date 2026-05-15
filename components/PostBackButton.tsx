'use client'
import React from 'react'
import { Button } from './ui/button'
import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'nextjs-toploader/app'

export default function PostBackButton() {
    const router = useRouter()

    const handleBack = () => {
        const referrer = document.referrer
        const isSaiditReferrer = referrer && new URL(referrer).hostname === window.location.hostname

        if (isSaiditReferrer) {
            router.back()
        } else {
            router.push('/')
        }
    }

    return (
        <Button variant={'redditGray'} onClick={handleBack} size={'icon'}>
            <ArrowLeft />
        </Button>
    )
}
