import React, { useEffect, useState } from 'react'

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Tables } from '@/database.types'
import { accountSettingsCategories } from '@/lib/settings-data'
import ChangeEmail from './account-setting-forms/change-email'
import { User } from '@supabase/supabase-js'

interface AccountDialogProps {
    profile: Tables<'users'> | null
    user: User | null
    open: boolean
    onOpenChange: (open: boolean) => void
    selectedCategory: (typeof accountSettingsCategories)[0]
}

export default function AccountDialog({ profile, user, open, onOpenChange, selectedCategory }: AccountDialogProps) {
    const [currentCategory, setCurrentCategory] = useState(selectedCategory)

    useEffect(() => {
        if (selectedCategory) {
            setCurrentCategory(selectedCategory)
        }
    }, [selectedCategory])

    const renderSettingsForm = () => {
        switch (currentCategory.id) {
            case "Email address":
                return <ChangeEmail user={user} setOpen={onOpenChange}/>
            case "Password":
                return <div>Change Password Form</div>
        }
    }

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
