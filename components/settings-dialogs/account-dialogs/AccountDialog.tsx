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

interface AccountDialogProps {
    profile: Tables<'users'> | null
    open: boolean
    onOpenChange: (open: boolean) => void
    selectedCategory: (typeof accountSettingsCategories)[0]
}

export default function AccountDialog({ profile, open, onOpenChange, selectedCategory }: AccountDialogProps) {
    const [currentCategory, setCurrentCategory] = useState(selectedCategory)

    useEffect(() => {
        if (selectedCategory) {
            setCurrentCategory(selectedCategory)
        }
    }, [selectedCategory])

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogTrigger></DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{currentCategory.name}</DialogTitle>
                    <DialogDescription>
                        {currentCategory.description}
                    </DialogDescription>
                </DialogHeader>
            </DialogContent>
        </Dialog>

    )
}
