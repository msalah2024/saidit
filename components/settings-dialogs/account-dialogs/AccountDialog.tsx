import React from 'react'

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
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogTrigger></DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Are you absolutely sure?</DialogTitle>
                    <DialogDescription>
                        This action cannot be undone. This will permanently delete your account
                        and remove your data from our servers.
                    </DialogDescription>
                </DialogHeader>
            </DialogContent>
        </Dialog>

    )
}
