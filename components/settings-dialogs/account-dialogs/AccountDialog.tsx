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
import { accountSettingsCategories } from '@/lib/settings-data'
import ChangeEmail from './account-setting-forms/change-email'
import ChangePassword from './account-setting-forms/change-password'
import ChangeGender from './account-setting-forms/change-gender'
import ManageDiscordIdentity from './account-setting-forms/manage-discord-identity'
import { User } from '@supabase/supabase-js'

interface AccountDialogProps {
    profile: Tables<'users'> | null
    user: User | null
    open: boolean
    onOpenChange: (open: boolean) => void
    selectedCategory: (typeof accountSettingsCategories)[0]
    discordIdentity: boolean | undefined
    googleIdentity: boolean | undefined
}

export default function AccountDialog({ profile, user, open, onOpenChange,
    selectedCategory, discordIdentity, googleIdentity }: AccountDialogProps) {

    const [currentCategory, setCurrentCategory] = useState(selectedCategory)
    const isDesktop = useMediaQuery("(min-width: 768px)")

    useEffect(() => {
        if (selectedCategory) {
            setCurrentCategory(selectedCategory)
        }
    }, [selectedCategory])

    useEffect(() => {
        if (discordIdentity && currentCategory.id === "Connect discord") {
            setCurrentCategory({
                id: "Disconnect discord",
                name: "Disconnect discord",
                description: "To continue, confirm your password",
            })
        }
    }, [discordIdentity, currentCategory.id])

    const renderSettingsForm = () => {
        switch (currentCategory.id) {
            case "Email address":
                return <ChangeEmail user={user} setCurrentCategory={setCurrentCategory} isDesktop={isDesktop} />
            case "Password":
                return <ChangePassword setCurrentCategory={setCurrentCategory} isDesktop={isDesktop} />
            case "Gender":
                return <ChangeGender profile={profile} onOpenChange={onOpenChange} isDesktop={isDesktop} />
            case "Connect discord":
                return <ManageDiscordIdentity discordIdentity={discordIdentity} isDesktop={isDesktop} user={user} onOpenChange={onOpenChange} />
            case "Disconnect discord":
                return <ManageDiscordIdentity discordIdentity={discordIdentity} isDesktop={isDesktop} user={user} onOpenChange={onOpenChange}/>
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
        <Drawer open={open} onOpenChange={onOpenChange}>
            <DrawerTrigger></DrawerTrigger>
            <DrawerContent>
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
