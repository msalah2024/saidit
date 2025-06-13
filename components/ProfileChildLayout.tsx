"use client"
import React from 'react'
import { useView } from '@/app/context/ViewContext'
import ProfileHeader from './ProfileHeader'
import ProfileRightSide from './ProfileRightSide'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function ProfileChildLayout({ children }: any) {
    const { view } = useView()

    return (
        <div className={`flex lg:mx-8 justify-center`}>
            <div className={`flex gap-x-4 ${view === 'Card' ? "w-full max-w-6xl" : "w-full"}`}>
                <div className="w-full">
                    <ProfileHeader />
                    <div className='mt-4 mx-4 lg:mx-0'>
                        {children}
                    </div>
                </div>
                <div className="w-80 hidden h-fit lg:flex">
                    <ProfileRightSide />
                </div>
            </div>
        </div>
    )
}
