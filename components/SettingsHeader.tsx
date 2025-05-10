"use client"
import React from 'react'
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { usePathname } from 'next/navigation'
import { useRouter } from 'nextjs-toploader/app';

export default function SettingsHeader() {
    const router = useRouter()
    const pathname = usePathname()

    const activeTab = pathname.includes('account') ? 'account' : 'profile'

    const handleTabChange = (value: string) => {
        router.push(`/protected/settings/${value}`);
    }

    return (
        <div className='mb-3'>
            <h2 className="scroll-m-20 pb-2 text-3xl font-semibold tracking-tight first:mt-0 text-primary-foreground-muted">
                Settings
            </h2>
            <Tabs defaultValue="account" value={activeTab} onValueChange={handleTabChange}>
                <TabsList className='h-fit bg-background gap-6 flex-wrap'>
                    <TabsTrigger value="account"
                        className='px-4a border-b-background py-2 text-primary-foreground-muted rounded-none 
                        data-[state=active]:border-b-white hover:border-b-primary-foreground-muted
                        data-[state=active]:text-primary-foreground  hover:text-primary-foreground'>
                        Account</TabsTrigger>
                    <TabsTrigger value="profile"
                        className='px-3 py-2 border-b-background text-primary-foreground-muted rounded-none 
                        data-[state=active]:border-b-white hover:border-b-primary-foreground-muted
                        data-[state=active]:text-primary-foreground  hover:text-primary-foreground'>
                        Profile</TabsTrigger>
                </TabsList>
            </Tabs>
        </div>
    )
}
