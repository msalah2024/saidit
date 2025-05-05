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
import ManageGoogleIdentity from './account-setting-forms/manage-google-identitiy'
import CreatePassword from './account-setting-forms/create-password'
import { User } from '@supabase/supabase-js'

interface AccountDialogProps {
    profile: Tables<'users'> | null
    user: User | null
    open: boolean
    onOpenChange: (open: boolean) => void
    selectedCategory: (typeof accountSettingsCategories)[0]
    discordIdentity: boolean | undefined
    googleIdentity: boolean | undefined
    hidePasswordButton: boolean | undefined
}

export default function AccountDialog({ profile, user, open, onOpenChange,
    selectedCategory, discordIdentity, googleIdentity, hidePasswordButton }: AccountDialogProps) {

    const [currentCategory, setCurrentCategory] = useState(selectedCategory)
    const isBigScreen = useMediaQuery("(min-width: 768px)")
    const isSmallMobile = useMediaQuery("(max-width: 413px)")
    const isDesktop = isBigScreen || isSmallMobile

    useEffect(() => {
        if (selectedCategory) {
            setCurrentCategory(selectedCategory)
        }
    }, [selectedCategory])

    useEffect(() => {
        if (hidePasswordButton) {
            if (currentCategory.id === "Email address") {
                setCurrentCategory({
                    id: "Create password",
                    name: "Change your email address",
                    description: "To change your email address, you need to create a Saidit password firs. We'll walk you through it.",
                })
            }
            if (currentCategory.id === "Connect discord" || currentCategory.id === "Disconnect discord") {
                setCurrentCategory({
                    id: "Create password",
                    name: "Manage discord identity",
                    description: "To manage your discord identity, you need to create a Saidit password firs. We'll walk you through it.",
                })
            }
            if (currentCategory.id === "Connect google" || currentCategory.id === "Disconnect google") {
                setCurrentCategory({
                    id: "Create password",
                    name: "Manage google identity",
                    description: "To manage your google identity, you need to create a Saidit password firs. We'll walk you through it.",
                })
            }
        }

        else {
            if (discordIdentity && currentCategory.id === "Connect discord") {
                setCurrentCategory({
                    id: "Disconnect discord",
                    name: "Disconnect discord",
                    description: "To continue, confirm your password",
                })
            }

            if (googleIdentity && currentCategory.id === "Connect google") {
                setCurrentCategory({
                    id: "Disconnect google",
                    name: "Disconnect google",
                    description: "To continue, confirm your password",
                })
            }
        }
    }, [discordIdentity, googleIdentity, hidePasswordButton, currentCategory.id])

    const renderSettingsForm = () => {
        switch (currentCategory.id) {
            case "Email address":
                return <ChangeEmail user={user} setCurrentCategory={setCurrentCategory} isDesktop={isDesktop} />
            case "Password":
                return <ChangePassword setCurrentCategory={setCurrentCategory} isDesktop={isDesktop} user={user} />
            case "Gender":
                return <ChangeGender profile={profile} onOpenChange={onOpenChange} isDesktop={isDesktop} />
            case "Connect discord":
                return <ManageDiscordIdentity discordIdentity={discordIdentity} isDesktop={isDesktop} user={user} onOpenChange={onOpenChange} />
            case "Disconnect discord":
                return <ManageDiscordIdentity discordIdentity={discordIdentity} isDesktop={isDesktop} user={user} onOpenChange={onOpenChange} />
            case "Connect google":
                return <ManageGoogleIdentity googleIdentity={googleIdentity} isDesktop={isDesktop} user={user} onOpenChange={onOpenChange} />
            case "Disconnect google":
                return <ManageGoogleIdentity googleIdentity={googleIdentity} isDesktop={isDesktop} user={user} onOpenChange={onOpenChange} />
            case "Create password":
                return <CreatePassword user={user} setCurrentCategory={setCurrentCategory} isDesktop={isDesktop} />
        }
    }

    if (isDesktop) {
        return (
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogTrigger></DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle className='text-xl'>{currentCategory.name}</DialogTitle>
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
                    <DrawerTitle className='text-xl'>{currentCategory.name}</DrawerTitle>
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
