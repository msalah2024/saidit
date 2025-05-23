"use client"
import { CakeSlice, Globe, Mail } from 'lucide-react'
import React from 'react'
import { Button } from './ui/button'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import Link from 'next/link'
import { format } from 'date-fns';
import { useCommunity } from '@/app/context/CommunityContext'

export default function CommunityRightSide() {
  const { community } = useCommunity()
  const createAtFormatted = format(new Date(community.created_at), 'dd/MM/yyyy');

  return (
    <div className='bg-black w-full p-8 rounded-2xl flex flex-col h-fit -mt-8 gap-4'>
      <div className='flex flex-col gap-2'>
        <p className='font-medium text-primary-foreground-muted'>{community.community_name}</p>
        <small className="text-sm font-medium leading-none text-muted-foreground">{community.description}</small>
      </div>
      <div className='flex flex-col gap-2'>
        <small className="text-sm font-medium leading-none text-muted-foreground flex gap-1 items-center"><CakeSlice /> Created {createAtFormatted}</small>
        <small className="text-sm font-medium leading-none text-muted-foreground flex gap-1 items-center"><Globe /> {community.type}</small>
      </div>
      <div className="flex items-center gap-4">
        <small className="text-sm font-medium leading-none">{community.community_memberships[0].count} member</small>
        <small className="text-sm font-medium leading-none flex items-center"><span className='text-primary text-4xl mr-1'>•</span>1 online</small>
      </div>
      <hr />
      <div className='flex flex-col gap-4'>
        <small className="text-sm font-medium text-muted-foreground leading-none">SETTINGS</small>
        <Button variant={'redditGray'} className='text-primary-foreground-muted' disabled>
          <Mail />Message Mods
        </Button>
        <Link href={`https://www.saidit.app/u/${community.users.username}`} className='flex items-center gap-2 text-primary-foreground-muted hover:underline'>
          <Avatar>
            <AvatarImage draggable="false" src={community.users.avatar_url || undefined} alt="avatar" className='rounded-full' />
            <AvatarFallback>
              /S
            </AvatarFallback>
          </Avatar>
          u/{community.users.username}
        </Link>
        <Button variant={'redditGray'} className='text-primary-foreground-muted' disabled>
          View all moderators
        </Button>
      </div>
    </div >
  )
}
