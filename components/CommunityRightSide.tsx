import { CakeSlice, Dot, Globe, Mail } from 'lucide-react'
import React from 'react'
import { Button } from './ui/button'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import Link from 'next/link'

export default function CommunityRightSide() {
  return (
    <div className='bg-black w-full p-8 rounded-2xl flex flex-col h-fit -mt-8 gap-4'>
      <div className='flex flex-col gap-2'>
        <p className='font-medium text-primary-foreground-muted'>flux</p>
        <small className="text-sm font-medium leading-none text-muted-foreground">This is flux</small>
      </div>
      <div className='flex flex-col gap-2'>
        <small className="text-sm font-medium leading-none text-muted-foreground flex gap-1 items-center"><CakeSlice /> Created 11/11/2011</small>
        <small className="text-sm font-medium leading-none text-muted-foreground flex gap-1 items-center"><Globe /> Public</small>
      </div>
      <div className="flex gap-8">
        <p className='font-medium'>1 <span className='text-sm text-muted-foreground'>Member</span></p>
        <p className='font-medium flex items-start'><Dot className='text-primary' />
          <span>
            1 <span className='text-sm text-muted-foreground'>Online</span>
          </span>
        </p>
      </div>
      <hr />
      <div className='flex flex-col gap-4'>
        <small className="text-sm font-medium text-muted-foreground leading-none">SETTINGS</small>
        <Button variant={'redditGray'} className='text-primary-foreground-muted'>
          <Mail />Message Mods
        </Button>
        <Link href={'#'} className='flex items-center gap-2 text-primary-foreground-muted'>
          <Avatar>
            <AvatarImage draggable="false" src={undefined} alt="avatar" className='rounded-full' />
            <AvatarFallback>
              /S
            </AvatarFallback>
          </Avatar>
          u/moe
        </Link>
        <Button variant={'redditGray'} className='text-primary-foreground-muted'>
          View all moderators
        </Button>
      </div>
    </div >
  )
}
