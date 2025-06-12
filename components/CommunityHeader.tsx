"use client"
import React, { useEffect, useRef, useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Button } from './ui/button'
import { CakeSlice, Camera, Ellipsis, Globe, Mail, Pencil, Plus, Rows2, Rows3 } from 'lucide-react'
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import Link from 'next/link'
import { useCommunity } from '@/app/context/CommunityContext'
import { format } from 'date-fns';
import { useGeneralProfile } from '@/app/context/GeneralProfileContext'
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { createCommunityMembership, removeCommunityMembership } from '@/app/actions'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import CommunityDrawer from './CommunityDrawer'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
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
import DetailsWidgetForm from './manage-community/details-widget-form'
import { createClient } from '@/utils/supabase/client'
import { useView } from '@/app/context/ViewContext'

export default function CommunityHeader() {
    const supabase = createClient()
    const router = useRouter()
    const { community } = useCommunity()
    const { user, profile } = useGeneralProfile()
    const { view, setView } = useView()

    const [globalAvatar, setGlobalAvatar] = useState<string | null>(null)
    const [globalBanner, setGlobalBanner] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const [open, setOpen] = useState(false)
    const [isFormDirty, setIsFormDirty] = useState(false)
    const [showAlert, setShowAlert] = useState(false)
    const [viewerCount, setViewerCount] = useState(0)

    const drawerTriggerRef = useRef<HTMLButtonElement>(null)

    const isOwner = community.users.account_id === user?.id
    const isMember = profile?.community_memberships.some((cm) => (cm.community_id === community.id))

    const createAtFormatted = format(new Date(community.created_at), 'dd/MM/yyyy');

    const openDrawer = () => {
        drawerTriggerRef.current?.click()
    }

    const handleJoinClick = async () => {
        if (!user) {
            handleAuthDialog()
            return
        }

        if (isMember) {
            try {
                setIsSubmitting(true)
                const result = await removeCommunityMembership(user?.id, community.id)
                if (result.success) {
                    router.refresh()
                    toast.success(`You’ve left s/${community.community_name}. Hope to see you again!`)
                }
                else {
                    toast.error("An error occurred")
                }
            } catch (error) {
                console.error(error)
            } finally {
                setIsSubmitting(false)
            }
        }
        else {
            try {
                setIsSubmitting(true)
                const result = await createCommunityMembership(user?.id, community.id)
                if (result.success) {
                    router.refresh()
                    toast.success(`You're now a member of s/${community.community_name}. Dive into the discussion!`)
                }
                else {
                    toast.error("An error occurred")
                }
            } catch (error) {
                console.error(error)
            } finally {
                setIsSubmitting(false)
            }

        }
    }

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
        const channel = supabase.channel(`community_header:${community.id}`, {
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

    const handleAuthDialog = () => {
        window.dispatchEvent(new CustomEvent('openAuthDialog'))
    }

    return (
        <div className='flex flex-col gap-4'>
            <div
                className={`h-30 bg-cover bg-center relative bg-no-repeat bg-gradient-to-r lg:rounded-md lg:mt-4 ${"from-[oklch(67.59%_0.1591_140.34)] to-[oklch(55%_0.17_230)]"}`}
                style={globalBanner ? { backgroundImage: `url(${globalBanner})` } : community.banner_url ? { backgroundImage: `url(${community.banner_url})` } : { backgroundImage: `bg-muted` }}
            >
                <div className={`flex gap-2 absolute top-22 ${!community.banner_url && 'lg:top-22!'} left-5 lg:left-8 `}>
                    <div className='relative'>
                        <Avatar className="lg:w-22 lg:h-22 lg:outline-none w-20 h-20 outline-3 outline-border">
                            <AvatarImage draggable={false} src={globalAvatar ? globalAvatar : community.image_url || undefined} className="rounded-full outline-3 outline-border" />
                            <AvatarFallback>/S</AvatarFallback>
                        </Avatar>
                        {isOwner && (
                            <Button
                                variant="redditGray"
                                size="icon"
                                className="absolute -right-3 top-1 p-1"
                                onClick={() => {
                                    openDrawer()
                                }}
                            >
                                <Camera />
                            </Button>
                        )
                        }
                    </div>
                    <div className='flex lg:flex-row flex-col'>
                        <h2 className="scroll-m-20 text-3xl font-semibold mt-10 tracking-tight">
                            s/{community.community_name}
                        </h2>
                        <div className="lg:hidden flex items-center gap-4">
                            <small className="text-sm font-medium leading-none">
                                {community.community_memberships[0].count}{" "}
                                {community.community_memberships[0].count === 1
                                    ? (community.members_nickname || "member")
                                    : (community.members_nickname || "members")}
                            </small>
                            <small className="text-sm font-medium leading-none flex items-center"><span className='text-primary text-4xl mr-1'>•</span>{viewerCount} {community.currently_viewing_nickname || 'online'}</small>
                        </div>
                    </div>
                </div>
                {isOwner && (
                    <Button
                        variant="redditGray"
                        size="icon"
                        className="mr-4 mb-2 self-end rounded-full absolute right-1 bottom-1"
                        onClick={() => {
                            openDrawer()
                        }}
                    >
                        <Camera />
                    </Button>
                )}
            </div>
            <div className="flex lg:justify-end mt-18 lg:mt-0">
                <div className='flex gap-2 ml-5'>
                    <Button variant={'outline'} className='rounded-full hover:bg-primary' asChild onClick={() => {
                        if (!user) {
                            handleAuthDialog()
                        }
                    }}>
                        {
                            user ?
                                <Link href={`/protected/create-post?community=${community.community_name}`}>
                                    <Plus />
                                    Create Post
                                </Link>
                                :
                                <div className='select-none hover:cursor-pointer'>
                                    <Plus />
                                    Create Post
                                </div>
                        }

                    </Button>
                    {
                        isOwner ?
                            <Button variant={'secondary'} className='rounded-full' disabled>Mod Tools</Button>
                            :
                            <Button disabled={isSubmitting} variant={isMember ? 'secondaryOutline' : 'secondary'} className='rounded-full px-5'
                                onClick={handleJoinClick}>
                                {
                                    isMember ? 'Joined' : 'Join'
                                }
                            </Button>
                    }
                    <Button variant={'outline'} size={'icon'} className='rounded-full hover:bg-reddit-gray' disabled>
                        <Ellipsis />
                    </Button>
                </div>
            </div>
            <Accordion type="single" collapsible className='bg-black rounded-2xl px-4 lg:hidden mx-4'>
                <AccordionItem value="item-1">
                    <AccordionTrigger className="hover:no-underline text-primary-foreground-muted">About</AccordionTrigger>
                    <AccordionContent className='flex flex-col gap-4'>
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
                            <small className="text-sm font-medium leading-none text-muted-foreground flex gap-1 items-center"><CakeSlice /> {createAtFormatted}</small>
                            <small className="text-sm font-medium leading-none text-muted-foreground flex gap-1 items-center"><Globe /> {community.type}</small>
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
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
            <div className="flex gap-2 mx-4 lg:mt-4">
                <Select defaultValue='New' disabled>
                    <SelectTrigger className="w-32">
                        <SelectValue placeholder="Best" />
                    </SelectTrigger>
                    <SelectContent defaultChecked>
                        <SelectGroup>
                            <SelectLabel>Sort by</SelectLabel>
                            <SelectItem value="Best">Best</SelectItem>
                            <SelectItem value="Hot">Hot</SelectItem>
                            <SelectItem value="New">New</SelectItem>
                            <SelectItem value="Top">Top</SelectItem>
                            <SelectItem value="Rising">Rising</SelectItem>
                        </SelectGroup>
                    </SelectContent>
                </Select>
                <Select value={view} onValueChange={setView}>
                    <SelectTrigger className="w-34">
                        <SelectValue placeholder="Card" />
                    </SelectTrigger>
                    <SelectContent defaultChecked>
                        <SelectGroup>
                            <SelectLabel>View</SelectLabel>
                            <SelectItem value="Card"><Rows2 className='text-primary-foreground' />Card</SelectItem>
                            <SelectItem value="Compact"><Rows3 className='text-primary-foreground' />Compact</SelectItem>
                        </SelectGroup>
                    </SelectContent>
                </Select>
            </div>
            <CommunityDrawer drawerTriggerRef={drawerTriggerRef} setGlobalAvatar={setGlobalAvatar} globalAvatar={globalAvatar}
                setGlobalBanner={setGlobalBanner} globalBanner={globalBanner} />
        </div >
    )
}
