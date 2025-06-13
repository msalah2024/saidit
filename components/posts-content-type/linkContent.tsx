import React from 'react'
import Link from 'next/link'

export default function LinkContent() {
    return (
        <div>
            <h4 className="scroll-m-20 mb-2 text-lg font-semibold tracking-tight">
                Someone special
            </h4>
            <Link href={'/'} className='text-accent line-clamp-1 hover:underline'>
                https://vercel.com/templates/next.js/next-video-starter
            </Link>
        </div>
    )
}
