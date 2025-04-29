"use client"
import React, { useState } from 'react'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { DisplayNameSchema } from '@/schema'
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { DialogClose } from '@/components/ui/dialog'
import { Loader2 } from 'lucide-react'
import { DrawerClose } from '@/components/ui/drawer'
import { Tables } from '@/database.types'
import { updateDisplayName } from '@/app/actions'
import { useRouter } from 'next/navigation'

interface ChangeDisplayNameProps {
    isDesktop: boolean
    profile: Tables<'users'> | null
    onOpenChange: (open: boolean) => void
}

export default function ChangeDisplayName({ isDesktop, profile, onOpenChange }: ChangeDisplayNameProps) {
    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = useState(false)

    const form = useForm<z.infer<typeof DisplayNameSchema>>({
        resolver: zodResolver(DisplayNameSchema),
        defaultValues: {
            displayName: profile?.display_name || "",
        },
    })

    async function onSubmit(values: z.infer<typeof DisplayNameSchema>) {
        try {
            setIsSubmitting(true)

            if (!profile) {
                form.setError("displayName", {
                    type: "custom",
                    message: "Profile fetch error",
                })
                return
            }

            const result = await updateDisplayName(values, profile.id)

            if (result.success) {
                onOpenChange(false)
                router.refresh()
            }

            else {
                form.setError("displayName", {
                    type: "custom",
                    message: result.message,
                })
                return
            }

        } catch (error) {
            console.error(error)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField
                    control={form.control}
                    name="displayName"
                    render={({ field }) => (
                        <FormItem>
                            <FormControl>
                                <Input placeholder="Display name" className='p-6' maxLength={90} {...field} />
                            </FormControl>
                            {
                                <p className={`text-sm text-end mx-2 font-medium ${field.value.length > 90 ? "text-destructive" : "text-muted-foreground"} `}>
                                    {field.value.length}/90
                                </p>
                            }
                            <FormMessage className='ml-2' />
                        </FormItem>
                    )}
                />
                {
                    isDesktop ?
                        (<div className='flex gap-2 justify-end mt-8'>
                            <DialogClose asChild>
                                <Button type="button" variant="redditGray">
                                    Cancel
                                </Button>
                            </DialogClose>
                            <Button type="submit" disabled={!form.formState.isValid || isSubmitting} className='rounded-full px-6'>{isSubmitting ? <>
                                <Loader2 className="mr-1 h-4 w-4 animate-spin" />Saving...
                            </> : 'Save'}</Button>
                        </div>) :
                        (
                            <div className='flex flex-col gap-2 justify-end my-4'>
                                <Button type="submit" disabled={!form.formState.isValid || isSubmitting} className='rounded-full'>{isSubmitting ? <>
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
            </form>
        </Form>

    )
}
