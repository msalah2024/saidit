'use client'
import React from 'react'
import { Button } from './ui/button'
import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'nextjs-toploader/app'

export default function PostBackButton() {
    const router = useRouter()
    return (
        <Button variant={'redditGray'}
            onClick={() => {
                router.back()
            }} size={'icon'} className='hidden lg:flex'>
            <ArrowLeft />
        </Button>
    )
}
