"use client"
import React from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TextContentForm } from '@/components/create-post-forms/editor'
export default function Page() {

    const tabs = [
        "text", 'images', "videos", "link", "poll"
    ]

    return (
        <div className='flex justify-center full-height'>
            <div className='flex flex-col gap-4 p-6 w-full max-w-6xl'>
                <h3 className="scroll-m-20 text-primary-foreground-muted text-2xl font-semibold tracking-tight">
                    Create Post
                </h3>
                <Tabs defaultValue="text">
                    <TabsList className='h-fit bg-background gap-2 sm:gap-6'>
                        {
                            tabs.map((tab) => (
                                <TabsTrigger key={tab} value={tab} className='border-b-background py-2 text-primary-foreground-muted rounded-none 
                        data-[state=active]:border-b-white hover:border-b-primary-foreground-muted
                        data-[state=active]:text-primary-foreground hover:text-primary-foreground'>
                                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                </TabsTrigger>
                            ))
                        }
                    </TabsList>
                    <TabsContent value="text">
                        <TextContentForm />
                        {/* hey */}
                    </TabsContent>
                    <TabsContent value="images">Change your password here.</TabsContent>
                </Tabs>
            </div>
        </div>
    )
}
