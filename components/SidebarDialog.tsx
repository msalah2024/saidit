import React, { useState, useEffect } from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import CreateCommunity from './CreateCommunity'
import { User } from '@supabase/supabase-js'

type SidebarDialogContent = {
    title: string,
    description: string
}

interface SidebarDialogProps {
    open: boolean
    setOpen: (open: boolean) => void
    dialogContent: SidebarDialogContent | undefined
    hasUnsavedChanges?: boolean
    user: User | null
}

export default function SidebarDialog({ open, setOpen, dialogContent, user }: SidebarDialogProps) {
    const [showConfirmation, setShowConfirmation] = useState(false)
    const [pendingAction, setPendingAction] = useState<(() => void) | null>(null)
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

    useEffect(() => {
        if (!hasUnsavedChanges) return

        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            e.preventDefault()
            e.returnValue = 'You have unsaved changes. Are you sure you want to leave?'
            return e.returnValue
        }

        window.addEventListener('beforeunload', handleBeforeUnload)
        return () => window.removeEventListener('beforeunload', handleBeforeUnload)
    }, [hasUnsavedChanges])

    useEffect(() => {
        if (open === false) {
            setHasUnsavedChanges(false)
        }
    }, [open])

    const handleOpenChange = (newOpen: boolean) => {
        if (hasUnsavedChanges && !newOpen) {
            setPendingAction(() => () => setOpen(false))
            setShowConfirmation(true)
        } else {
            setOpen(newOpen)
        }
    }

    const handleConfirm = () => {
        setShowConfirmation(false)
        pendingAction?.()
        setHasUnsavedChanges(false)
    }

    const handleCancel = () => {
        setShowConfirmation(false)
        setPendingAction(null)
    }

    return (
        <>
            <Dialog open={open} onOpenChange={handleOpenChange}>
                {
                    dialogContent?.title === 'Create a Community' &&
                    <DialogContent showCloseButton={false}
                        onOpenAutoFocus={(e) => e.preventDefault()}
                        className="lg:w-screen! lg:h-screen! h-[99%] w-[99%] max-w-none! m-0 p-0 lg:rounded-none flex focus:outline-none transition-none">
                        <CreateCommunity
                            user={user}
                            dialogContent={dialogContent}
                            setOpen={setOpen}
                            onUnsavedChanges={(unsaved) => setHasUnsavedChanges(unsaved)}
                        />
                    </DialogContent>
                }
            </Dialog>

            <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
                <DialogContent
                    onOpenAutoFocus={(e) => e.preventDefault()}
                >
                    <DialogHeader>
                        <DialogTitle>Unsaved Changes</DialogTitle>
                        <DialogDescription>
                            You have unsaved changes. Are you sure you want to leave?
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={handleCancel} className='rounded-full'>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleConfirm} className='rounded-full'>
                            Discard Changes
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}
