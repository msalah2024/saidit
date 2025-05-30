"use client"
import { CakeSlice, Globe, Mail, Pencil } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { Button } from './ui/button'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import Link from 'next/link'
import { format } from 'date-fns';
import { useCommunity } from '@/app/context/CommunityContext'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import DetailsWidgetForm from './manage-community/details-widget-form'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { createClient } from '@/utils/supabase/client'
import { useGeneralProfile } from '@/app/context/GeneralProfileContext'


export default function CommunityRightSide() {
  const supabase = createClient()
  const { community } = useCommunity()
  const { user } = useGeneralProfile()
  const [open, setOpen] = useState(false)
  const [isFormDirty, setIsFormDirty] = useState(false)
  const [showAlert, setShowAlert] = useState(false)
  const [viewerCount, setViewerCount] = useState(0)

  const createAtFormatted = format(new Date(community.created_at), 'dd/MM/yyyy');

  const isOwner = community.users.account_id === user?.id

  const handleDialogOpenChange = (nextOpen: boolean) => {
    if (!nextOpen && isFormDirty) {
      setShowAlert(true)
      return
    }
    setOpen(nextOpen)
  }

  const handleAlertCancel = () => {
    setShowAlert(false)
  }

  const handleAlertContinue = () => {
    setShowAlert(false)
    setOpen(false)
  }

  useEffect(() => {
    const channel = supabase.channel(`community_sidebar:${community.id}`, {
      config: { presence: { key: user?.id } },
    })

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState()
        setViewerCount(Object.keys(state).length)
      })
      .subscribe(status => {
        if (status === 'SUBSCRIBED') {
          channel.track({ user_id: user?.id })
        }
      })

    return () => {
      channel.unsubscribe()
    }

  }, [supabase, community.id, user?.id])

  return (
    <div className='bg-black w-full p-5 rounded-2xl flex flex-col h-fit gap-4 -mt-12'>
      <div className='flex flex-col gap-2'>
        <div className='flex items-center justify-between'>
          <p className='font-medium text-primary-foreground-muted'>{community.display_name || community.community_name}</p>
          {
            isOwner &&
            <Button size='icon' variant={'redditGray'} onClick={() => { setOpen(true) }}>
              <Pencil />
            </Button>
          }
        </div>
        <small className="text-sm font-medium leading-none text-muted-foreground">{community.description}</small>
      </div>
      <div className='flex flex-col gap-2'>
        <small className="text-sm font-medium leading-none text-muted-foreground flex gap-1 items-center"><CakeSlice /> Created {createAtFormatted}</small>
        <small className="text-sm font-medium leading-none text-muted-foreground flex gap-1 items-center"><Globe /> {community.type}</small>
      </div>
      <div className="flex items-center gap-4">
        <small className="text-sm font-medium leading-none">
          {community.community_memberships[0].count}{" "}
          {community.community_memberships[0].count === 1
            ? (community.members_nickname || "member")
            : (community.members_nickname || "members")}
        </small>
        <small className="text-sm font-medium leading-none flex items-center"><span className='text-primary text-4xl mr-1'>•</span>{viewerCount} {community.currently_viewing_nickname || 'online'}</small>
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
      <Dialog open={open} onOpenChange={handleDialogOpenChange}>
        <DialogContent
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle> Edit community details widget </DialogTitle>
            <DialogDescription>
              Briefly describes your community and members. Always appears at the top of the sidebar.
            </DialogDescription>
          </DialogHeader>
          <DetailsWidgetForm setOpen={setOpen} setIsFormDirty={setIsFormDirty} />
        </DialogContent>
      </Dialog>
      <AlertDialog open={showAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes. Are you sure you want to leave? Your changes will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleAlertCancel}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleAlertContinue}>Discard Changes</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div >
  )
}
