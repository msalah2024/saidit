"use client"
import React, { useEffect, useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tables } from '@/database.types'
import TextForm from '@/components/create-post-forms/text-form'
import ImagesForm from '@/components/create-post-forms/images-form'
import { useRouter, useSearchParams } from 'next/navigation'

export default function Page() {
    const [selectedCommunity, setSelectedCommunity] = useState<Tables<'communities'> | null>(null)
    const router = useRouter()
    const searchParams = useSearchParams()

    const initialTab = searchParams.get('tab') || 'text'
    const [activeTab, setActiveTab] = useState(initialTab)

    const tabs = [
        "text", 'images', "videos", "link", "poll"
    ]

    useEffect(() => {
        const tab = searchParams.get('tab')
        if (tab && tabs.includes(tab)) {
            setActiveTab(tab)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams])

    const handleTabChange = (value: string) => {
        setActiveTab(value)
        const params = new URLSearchParams(searchParams.toString())
        params.set('tab', value)
        router.replace(`?${params.toString()}`, { scroll: false })
    }


    return (
        <div className='flex justify-center full-height'>
            <div className='flex flex-col gap-4 p-6 w-full max-w-4xl'>
                <h3 className="scroll-m-20 text-primary-foreground-muted text-2xl font-semibold tracking-tight">
                    Create Post
                </h3>
                <Tabs value={activeTab} onValueChange={handleTabChange}>
                    <TabsList className='h-fit bg-background gap-2 sm:gap-6'>
                        {
                            tabs.map((tab) => (
                                <TabsTrigger disabled={tab !== "text" && tab !== "images"}
                                    key={tab} value={tab} className='border-b-background py-2 text-primary-foreground-muted rounded-none 
                        data-[state=active]:border-b-white hover:border-b-primary-foreground-muted
                        data-[state=active]:text-primary-foreground hover:text-primary-foreground'>
                                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                </TabsTrigger>
                            ))
                        }
                    </TabsList>
                    <TabsContent value="text">
                        <TextForm selectedCommunity={selectedCommunity} setSelectedCommunity={setSelectedCommunity} />
                    </TabsContent>
                    <TabsContent value="images">
                        <ImagesForm selectedCommunity={selectedCommunity} setSelectedCommunity={setSelectedCommunity} />
                    </TabsContent>
                    <TabsContent value="videos">Video</TabsContent>
                    <TabsContent value="link">Link</TabsContent>
                    <TabsContent value="poll">Poll</TabsContent>
                </Tabs>
            </div>
        </div>
    )
}
