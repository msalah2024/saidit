"use client"
import React, { useCallback, useEffect, useState } from 'react'
import { useGeneralProfile } from '@/app/context/GeneralProfileContext'
import { profileSettingsCategories } from '@/lib/settings-data'
import { Button } from '@/components/ui/button'
import { ChevronRight } from 'lucide-react'
import ProfileDialog from '@/components/settings-dialogs/profile-dialogs/ProfileDialog'
import { getSocialLinks } from '@/app/actions'
import { toast } from 'sonner'
import { Tables } from '@/database.types'

export default function Page() {
    const { profile, user } = useGeneralProfile()
    const [open, setOpen] = useState(false)
    const [category, setCategory] = useState(profileSettingsCategories[0])
    const [syncedPlatforms, setSyncedPlatforms] = useState<Tables<'social_links'>[] | undefined>([])

    const handleOpenSettings = (category: (typeof profileSettingsCategories)[0]) => {
        setCategory(category)
        setOpen(true)
    }

    const fetchLinks = useCallback(async () => {
        if (!user) return;
        try {
            const links = await getSocialLinks(user?.id);
            if (links.success) {
                setSyncedPlatforms(links?.data);
            } else {
                toast.error("Error fetching social links");
            }
        } catch (error) {
            console.error(error);
        }
    }, [user]);

    useEffect(() => {
        fetchLinks();
    }, [fetchLinks]);

    return (
        <div className='space-y-4'>
            <h3 className="scroll-m-20 text-2xl text-primary-foreground-muted font-semibold tracking-tight">
                General
            </h3>

            <div className="flex flex-col gap-2">
                {
                    profileSettingsCategories.map((category) => (
                        <Button
                            key={category.name}
                            variant="ghost"
                            className="w-full text-primary-foreground-muted py-6 px-0 sm:px-4 justify-between hover:bg-background group"
                            onClick={() => handleOpenSettings(category)}
                        >
                            <div className='flex flex-col items-start'>
                                {category.name}
                                {
                                    category.buttonDescription &&
                                    <span className="text-sm text-muted-foreground text-wrap text-start">{category.buttonDescription}</span>
                                }
                            </div>
                            <div className='p-2 rounded-full group-hover:bg-reddit-gray'>
                                <ChevronRight />
                            </div>
                        </Button>
                    ))
                }
            </div>
            <ProfileDialog profile={profile} user={user} open={open} onOpenChange={setOpen} selectedCategory={category}
                fetchLinks={fetchLinks} syncedPlatforms={syncedPlatforms}
            />
        </div>
    )
}
