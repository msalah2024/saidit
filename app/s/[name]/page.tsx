"use client"
import { useCommunity } from '@/app/context/CommunityContext'
import React from 'react'

export default function Page() {
    const { community } = useCommunity()

    return (
        <div className='full-height flex justify-center items-center'>
            <h2 className="scroll-m-20 text-3xl border-b pb-2 font-semibold tracking-tight first:mt-0">
                Welcome to <span className='text-primary'>{community.community_name}</span>
            </h2>
        </div>
    )
}
