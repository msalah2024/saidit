import React from 'react'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Button } from './ui/button'
import { CakeSlice, Ellipsis, Globe, Mail, Plus } from 'lucide-react'
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import Link from 'next/link'


export default function CommunityHeader() {
    return (
        <div className='flex flex-col gap-4'>
            <div
                className={`h-24 bg-cover bg-center bg-no-repeat bg-gradient-to-r lg:rounded-md lg:mt-4 ${"from-[oklch(67.59%_0.1591_140.34)] to-[oklch(55%_0.17_230)]"}`}
            // style={globalBanner ? { backgroundImage: `url(${globalBanner})` } : undefined}
            >
            </div>
            <div className='relative'>
                <div className="flex flex-col lg:flex-row lg:justify-between items-start lg:items-center">
                    <div className='flex gap-2 relative -top-10 left-5'>
                        <Avatar className="lg:w-22 lg:h-22 lg:outline-none w-20 h-20 outline-3 outline-border">
                            <AvatarImage draggable={false} src={undefined} className="rounded-full" />
                            <AvatarFallback>/S</AvatarFallback>
                        </Avatar>
                        <div className='flex lg:flex-row flex-col'>
                            <h2 className="scroll-m-20 text-3xl font-semibold mt-8 tracking-tight">
                                flux
                            </h2>
                            <div className="lg:hidden flex items-center gap-4">
                                <small className="text-sm font-medium leading-none">1 member</small>
                                <small className="text-sm font-medium leading-none flex items-center"><span className='text-primary text-4xl mr-1'>•</span>1 online</small>
                            </div>
                        </div>
                    </div>
                    <div className='flex gap-2 ml-5 lg:mb-auto lg:mt-0 -mt-8'>
                        <Button variant={'outline'} className='rounded-full hover:bg-primary' disabled>
                            <Plus />
                            Create Post
                        </Button>
                        <Button variant={'secondary'} className='rounded-full' disabled>Join</Button>
                        <Button variant={'outline'} size={'icon'} className='rounded-full hover:bg-reddit-gray' disabled>
                            <Ellipsis />
                        </Button>
                    </div>
                </div>
            </div>
            <Accordion type="single" collapsible className='bg-black rounded-2xl px-4 lg:hidden mx-4'>
                <AccordionItem value="item-1">
                    <AccordionTrigger className="hover:no-underline text-primary-foreground-muted">About</AccordionTrigger>
                    <AccordionContent className='flex flex-col gap-4'>
                        <div className='flex flex-col gap-2'>
                            <p className='font-medium text-primary-foreground-muted'>flux</p>
                            <small className="text-sm font-medium leading-none text-muted-foreground">This is flux</small>
                        </div>
                        <div className='flex flex-col gap-2'>
                            <small className="text-sm font-medium leading-none text-muted-foreground flex gap-1 items-center"><CakeSlice /> Created 11/11/2011</small>
                            <small className="text-sm font-medium leading-none text-muted-foreground flex gap-1 items-center"><Globe /> Public</small>
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
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </div>
    )
}
