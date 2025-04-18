"use client"
import React, { useState } from 'react'
import AccountDialog from '@/components/settings-dialogs/account-dialogs/AccountDialog'
import { useGeneralProfile } from '@/app/context/GeneralProfileContext'
import { accountSettingsCategories } from '@/lib/settings-data'
import { Button } from '@/components/ui/button'
import { ChevronRight } from 'lucide-react'

export default function Page() {
    const { profile, user } = useGeneralProfile()
    const [open, setOpen] = useState(false)
    const [category, setCategory] = useState(accountSettingsCategories[0])

    const handleOpenSettings = (category: (typeof accountSettingsCategories)[0]) => {
        setCategory(category)
        setOpen(true)
    }

    return (
        <div className='space-y-4'>
            <h3 className="scroll-m-20 text-2xl text-primary-foreground-muted font-semibold tracking-tight">
                General
            </h3>

            <div className="flex flex-col gap-2">
                {accountSettingsCategories.slice(0, 3).map((category) => (
                    <Button
                        key={category.name}
                        variant="ghost"
                        className="w-full text-primary-foreground-muted p-6 justify-between hover:bg-background group"
                        onClick={() => handleOpenSettings(category)}
                    >
                        <div className='flex flex-col items-start'>
                            {category.name}
                            {user?.new_email && category.id === "Email address" && (
                                <span className="text-sm text-muted-foreground">Pending verification</span>
                            )}
                        </div>
                        <div className='flex gap-2 items-center'>
                            {category === accountSettingsCategories[0] && profile?.email ? (
                                <span className={`ml-2 text-sm text-muted-foreground ${user?.new_email && `text-red-400`}`}>{profile.email}</span>
                            ) : (category === accountSettingsCategories[2] && profile?.gender && (
                                <span className="ml-2 text-sm text-muted-foreground">{profile.gender.charAt(0).toUpperCase() + profile.gender.slice(1)}</span>
                            ))}
                            <div className='p-2 rounded-full group-hover:bg-reddit-gray'>
                                <ChevronRight />
                            </div>
                        </div>
                    </Button>
                ))}
            </div>

            <h3 className="scroll-m-20 text-2xl text-primary-foreground-muted font-semibold tracking-tight">
                Advanced
            </h3>
            {
                accountSettingsCategories.slice(3).map((category) => (
                    <Button
                        key={category.name}
                        variant="ghost"
                        className="w-full text-primary-foreground-muted p-6 justify-between hover:bg-background group"
                        onClick={() => handleOpenSettings(category)}
                    >
                        {category.name}
                        <div className='p-2 rounded-full group-hover:bg-reddit-gray'>
                            <ChevronRight />
                        </div>
                    </Button>
                ))
            }
            <AccountDialog profile={profile} user={user} open={open} onOpenChange={setOpen} selectedCategory={category} />
        </div>
    )
}
