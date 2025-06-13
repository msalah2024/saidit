"use client"
import React from 'react'
import CommunityHeader from './CommunityHeader'
import CommunityRightSide from './CommunityRightSide'
import { useView } from '@/app/context/ViewContext'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function CommunityChildLayout({ children }: any) {
  const { view } = useView()

  return (
    <div className='lg:mx-8 flex justify-center'>
      <div className={`w-full ${view === 'Card' ? "max-w-6xl" : "w-full"} `}>
        <CommunityHeader />
        <div className='flex gap-4'>
          <div className='w-full mt-4 mx-4'>
            {children}
          </div>
          <div className='min-w-80 w-80 hidden lg:flex'>
            <CommunityRightSide />
          </div>
        </div>
      </div>
    </div>
  )
}
