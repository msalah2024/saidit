"use client"
import React, { useState } from 'react'
import { Button } from './ui/button'
import { Compass, Home, Menu, Telescope, Zap } from 'lucide-react'
import { ScrollArea } from './ui/scroll-area'

export default function Sidebar() {
    const [collapsed, setCollapsed] = useState(false)

    const feeds = [
        { name: "Home", icon: <Home /> },
        { name: "Popular", icon: <Zap /> },
        { name: "Explore", icon: <Telescope /> },
        { name: "All", icon: <Compass /> },
    ]

    const handleCollapse = () => {
        if (collapsed) {
            setCollapsed(false)
        }
        else {
            setCollapsed(true)
        }
    }

    return (
        <div className={`flex flex-col items-center transition-all duration-300 full-height border-r ${collapsed ? 'w-16' : 'w-80'} relative`}>
            <Button onClick={() => {
                handleCollapse()
            }}
                variant={'outline'} size={'icon'} className='rounded-full absolute -right-4.5 top-10 z-1 hover:bg-reddit-gray'><Menu /></Button>
            <ScrollArea className="flex-1 w-full mt-2">
                <div className="flex flex-col gap-2 pt-2">
                    {feeds.map((feed) => (
                        <Button key={feed.name} variant={'ghost'}
                            size={collapsed ? 'icon' : 'default'}
                            className={`hover:bg-reddit-gray rounded-full ml-3 ${collapsed ? '' : 'flex-1 justify-start mr-8'}`}>
                            <span className="flex items-center">
                                <span className='mx-2'>
                                    {feed.icon}
                                </span>
                                <span className={`transition-opacity duration-300 ${collapsed ? 'opacity-0 w-0' : 'opacity-100'}`}>
                                    {feed.name}
                                </span>
                            </span>
                        </Button>
                    ))}
                </div>
                <hr className='mt-2 mx-3' />
            </ScrollArea>
        </div>
    )
}