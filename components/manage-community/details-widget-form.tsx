"use client"
import React, { useEffect, useState } from 'react'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { ManageDetailsWidgetSchema } from '@/schema'
import { useCommunity } from '@/app/context/CommunityContext'

import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { DialogClose } from '@radix-ui/react-dialog'
import { Textarea } from '../ui/textarea'
import { useMediaQuery } from '@/hooks/use-media-query'
import { Loader2 } from 'lucide-react'
import { updateCommunityDetails } from '@/app/actions'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { ScrollArea } from '../ui/scroll-area'

interface DetailsWidgetFormProps {
    setOpen: (open: boolean) => void
    setIsFormDirty?: (dirty: boolean) => void
}

export default function DetailsWidgetForm({ setOpen, setIsFormDirty }: DetailsWidgetFormProps) {
    const router = useRouter()
    const { community } = useCommunity()
    const isDesktop = useMediaQuery("(min-width: 768px)")
    const [isSubmitting, setIsSubmitting] = useState(false)

    const form = useForm<z.infer<typeof ManageDetailsWidgetSchema>>({
        resolver: zodResolver(ManageDetailsWidgetSchema),
        defaultValues: {
            displayName: community.display_name || "",
            description: community.description || "",
            membersNickname: community.members_nickname || "",
            currentlyViewingNickname: community.currently_viewing_nickname || ""
        },
    })

    const { isDirty } = form.formState

    async function onSubmit(values: z.infer<typeof ManageDetailsWidgetSchema>) {
        try {
            setIsSubmitting(true)

            const result = await updateCommunityDetails(values, community.id)
            if (result.success) {
                setOpen(false)
                router.refresh()
                toast.success("Community details updated successfully")
            }

            else {
                toast.error("An error occurred!")
            }

        } catch (error) {
            console.error(error)
        } finally {
            setIsSubmitting(false)
        }

    }
    useEffect(() => {
        if (!isDirty) return

        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            e.preventDefault()
            e.returnValue = 'You have unsaved changes. Are you sure you want to leave?'
            return e.returnValue
        }

        window.addEventListener('beforeunload', handleBeforeUnload)
        return () => window.removeEventListener('beforeunload', handleBeforeUnload)
    }, [isDirty])

    useEffect(() => {
        setIsFormDirty?.(isDirty)
    }, [isDirty, setIsFormDirty])

    return (
        <ScrollArea className='h-[500px] pr-4 sm:h-full'>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 px-1">
                    <FormField
                        control={form.control}
                        name="displayName"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Display name</FormLabel>
                                <FormControl>
                                    <Input placeholder="display name" className='p-6' {...field} />
                                </FormControl>
                                <FormDescription>
                                    This is your community display name.
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="membersNickname"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Members&#39; nickname</FormLabel>
                                <FormControl>
                                    <Input placeholder="members nickname" className='p-6' {...field} />
                                </FormControl>
                                <FormDescription>
                                    Give a nickname to your members.
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="currentlyViewingNickname"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Currently viewing nickname</FormLabel>
                                <FormControl>
                                    <Input placeholder="currently viewing nickname" className='p-6' {...field} />
                                </FormControl>
                                <FormDescription>
                                    Describe members who are currently viewing and contributing to your community.
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Community description</FormLabel>
                                <FormControl>
                                    <Textarea
                                        placeholder="Tell potential members what your community is about"
                                        className="resize-none min-h-24"
                                        {...field}
                                    />
                                </FormControl>
                                <FormDescription>
                                    Describe your community to visitors.
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    {
                        isDesktop ?
                            <div className='flex gap-2 justify-end'>
                                <DialogClose asChild>
                                    <Button variant={'redditGray'}>
                                        Cancel
                                    </Button>
                                </DialogClose>
                                <Button type="submit" className='px-6' disabled={isSubmitting}>
                                    {
                                        isSubmitting ?
                                            <>
                                                <Loader2 className="mr-1 h-4 w-4 animate-spin" />Saving...
                                            </>
                                            :
                                            <>
                                                Save
                                            </>
                                    }
                                </Button>
                            </div>
                            :
                            <div className='flex flex-col gap-2'>
                                <Button type="submit" className='p-6' disabled={isSubmitting}>
                                    {
                                        isSubmitting ?
                                            <>
                                                <Loader2 className="mr-1 h-4 w-4 animate-spin" />Saving...
                                            </>
                                            :
                                            <>
                                                Save
                                            </>
                                    }
                                </Button>
                                <DialogClose asChild className='p-6'>
                                    <Button variant={'redditGray'}>
                                        Cancel
                                    </Button>
                                </DialogClose>
                            </div>
                    }
                </form>
            </Form >
        </ScrollArea>
    )
}
