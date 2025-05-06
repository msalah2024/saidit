import React, { useEffect, useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Drawer,
    DrawerContent,
    DrawerDescription,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer"
import { useMediaQuery } from "@/hooks/use-media-query"
import { Tables } from '@/database.types'
import { User } from '@supabase/supabase-js'
import { profileSettingsCategories } from '@/lib/settings-data'
import ChangeDisplayName from './profile-settings-forms/change-display-name'
import ChangeDescription from './profile-settings-forms/change-description'
import ChangeAvatar from './profile-settings-forms/change-avatar'
import ChangeBanner from './profile-settings-forms/change-banner'
import ChangeSocialLinks from './profile-settings-forms/change-social-links'

interface ProfileDialogProps {
    profile: Tables<'users'> | null
    user: User | null
    open: boolean
    onOpenChange: (open: boolean) => void
    selectedCategory: (typeof profileSettingsCategories)[0]
    syncedPlatforms: Tables<"social_links">[] | undefined;
    fetchLinks: () => Promise<void>;

}

export default function ProfileDialog({ profile, user, open, onOpenChange, selectedCategory, syncedPlatforms, fetchLinks }: ProfileDialogProps) {

    const [currentCategory, setCurrentCategory] = useState(selectedCategory)
    const [dismissible, setDismissible] = useState(true)
    const [shouldScaleBackground, setShouldScaleBackground] = useState(true)
    const isDesktop = useMediaQuery("(min-width: 768px)")

    useEffect(() => {
        if (selectedCategory) {
            setCurrentCategory(selectedCategory)
        }
    }, [selectedCategory])

    const renderSettingsForm = () => {
        switch (currentCategory.id) {
            case "Display name":
                return <ChangeDisplayName isDesktop={isDesktop} profile={profile} onOpenChange={onOpenChange} />
            case "About description":
                return <ChangeDescription isDesktop={isDesktop} profile={profile} onOpenChange={onOpenChange} />
            case "Avatar":
                return <ChangeAvatar isDesktop={isDesktop} profile={profile} user={user} onOpenChange={onOpenChange}
                    setDismissible={setDismissible} setShouldScaleBackground={setShouldScaleBackground} />
            case "Banner": return <ChangeBanner isDesktop={isDesktop} profile={profile} user={user} onOpenChange={onOpenChange}
                setDismissible={setDismissible} setShouldScaleBackground={setShouldScaleBackground}
            />
            case "Social links":
                return <ChangeSocialLinks isDesktop={isDesktop} user={user}
                    fetchLinks={fetchLinks} syncedPlatforms={syncedPlatforms}
                />
        }
    }

    if (isDesktop) {
        return (
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogTrigger></DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>{currentCategory.name}</DialogTitle>
                        <DialogDescription>
                            {currentCategory.description}
                        </DialogDescription>
                    </DialogHeader>
                    {renderSettingsForm()}
                </DialogContent>
            </Dialog>
        )
    }

    return (
        <Drawer open={open} onOpenChange={onOpenChange} dismissible={dismissible} shouldScaleBackground={shouldScaleBackground}>
            <DrawerTrigger></DrawerTrigger>
            <DrawerContent className='max-h-[100vh]'>
                <DrawerHeader className="text-left">
                    <DrawerTitle>{currentCategory.name}</DrawerTitle>
                    <DrawerDescription>
                        {currentCategory.description}
                    </DrawerDescription>
                </DrawerHeader>
                <div className='px-4'>
                    {renderSettingsForm()}
                </div>
            </DrawerContent>
        </Drawer>

    )
}
