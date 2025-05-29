"use client"
import React, { useRef, useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Button } from './ui/button'
import { CakeSlice, Camera, Ellipsis, Globe, Mail, Plus, Rows2, Rows3 } from 'lucide-react'
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

export default function CommunityHeader() {
    const router = useRouter()
    const { community } = useCommunity()
    const { user, profile } = useGeneralProfile()

    const [globalAvatar, setGlobalAvatar] = useState<string | null>(null)
    const [globalBanner, setGlobalBanner] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const drawerTriggerRef = useRef<HTMLButtonElement>(null)

    const isOwner = community.users.account_id === user?.id
    const isMember = profile?.community_memberships.some((cm) => (cm.community_id === community.id))

    const createAtFormatted = format(new Date(community.created_at), 'dd/MM/yyyy');

    const openDrawer = () => {
        drawerTriggerRef.current?.click()
    }

    const handleJoinClick = async () => {
        if (!user) {
            toast.info("Please sign in to join communities")
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
                            <small className="text-sm font-medium leading-none">{community.community_memberships[0].count} member</small>
                            <small className="text-sm font-medium leading-none flex items-center"><span className='text-primary text-4xl mr-1'>•</span>1 online</small>
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
                    <Button variant={'outline'} className='rounded-full hover:bg-primary' disabled>
                        <Plus />
                        Create Post
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
                            <p className='font-medium text-primary-foreground-muted'>{community.community_name}</p>
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
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
            <div className="flex gap-2 mx-4 lg:mt-4">
                <Select defaultValue='Best'>
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
                <Select defaultValue='Card'>
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
