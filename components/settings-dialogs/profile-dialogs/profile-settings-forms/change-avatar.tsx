"use client"
import React, { useRef, useState } from 'react'
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar"
import { CloudUpload, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DialogClose } from '@/components/ui/dialog'
import { DrawerClose } from '@/components/ui/drawer'
import { Tables } from '@/database.types'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'

interface ChangeAvatarProps {
    isDesktop: boolean
    profile: Tables<'users'> | null
    onOpenChange: (open: boolean) => void
}

export default function ChangeAvatar({ isDesktop, profile, onOpenChange }: ChangeAvatarProps) {
    const router = useRouter()
    const [avatar, setAvatar] = useState<string | null>(null)
    const [step, setStep] = useState(0)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isDragging, setIsDragging] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onload = (e) => {
                setAvatar(e.target?.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    const triggerFileInput = () => {
        fileInputRef.current?.click()
    }

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(true)
    }

    const handleDragLeave = () => {
        setIsDragging(false)
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)

        const file = e.dataTransfer.files?.[0]
        if (file && file.type.startsWith("image/")) {
            const reader = new FileReader()
            reader.onload = (e) => {
                setAvatar(e.target?.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    return (
        <div className='flex flex-col items-center w-full'>
            <Avatar className="w-20 h-20 select-none mb-4">
                <AvatarImage src={avatar || ""} alt="Avatar" className='rounded-full' draggable={false} />
                <AvatarFallback>?</AvatarFallback>
            </Avatar>

            <div className={`flex flex-col items-center w-full rounded-lg border-2 border-dashed p-6 
            ${isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/20"}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                <CloudUpload size={40} className='text-muted-foreground' />
                <div className='space-y-1 text-center'>
                    <p className="text-sm font-medium">Drag and drop your image here</p>
                    <p className="text-xs text-muted-foreground">PNG, JPG or GIF (max. 2MB)</p>
                </div>
                <Button variant='outline' className='mt-3 rounded-full' onClick={triggerFileInput}>Select Image</Button>
                <Input ref={fileInputRef} onChange={handleFileChange} type='file' className='hidden' accept='image/*'></Input>
            </div>
            {
                isDesktop ?
                    (<div className='flex w-full gap-2 justify-end mt-8'>
                        <DialogClose asChild>
                            <Button type="button" variant="redditGray">
                                Cancel
                            </Button>
                        </DialogClose>
                        <Button disabled={isSubmitting} className='rounded-full px-6'>{isSubmitting ? <>
                            <Loader2 className="mr-1 h-4 w-4 animate-spin" />Saving...
                        </> : 'Save'}</Button>
                    </div>) :
                    (
                        <div className='flex w-full flex-col gap-2 justify-end my-4'>
                            <Button disabled={isSubmitting} className='rounded-full'>{isSubmitting ? <>
                                <Loader2 className="mr-1 h-4 w-4 animate-spin" />Saving...
                            </> : 'Save'}</Button>
                            <DrawerClose asChild>
                                <Button type="button" variant="redditGray">
                                    Cancel
                                </Button>
                            </DrawerClose>
                        </div>
                    )
            }

        </div>
    )
}
