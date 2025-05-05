"use client"
import React, { useState } from 'react'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage,
} from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { DescriptionSchema } from '@/schema'
import { DialogClose } from '@/components/ui/dialog'
import { Loader2 } from 'lucide-react'
import { DrawerClose } from '@/components/ui/drawer'
import { Tables } from '@/database.types'
import { updateDescription } from '@/app/actions'
import { useRouter } from 'next/navigation'

interface ChangeDescriptionProps {
    isDesktop: boolean
    profile: Tables<'users'> | null
    onOpenChange: (open: boolean) => void
}

export default function ChangeDescription({ isDesktop, profile, onOpenChange }: ChangeDescriptionProps) {
    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = useState(false)

    const form = useForm<z.infer<typeof DescriptionSchema>>({
        resolver: zodResolver(DescriptionSchema),
        defaultValues: {
            description: profile?.description || ""
        },
    })

    async function onSubmit(value: z.infer<typeof DescriptionSchema>) {
        try {
            setIsSubmitting(true)

            if (!profile) {
                form.setError("description", {
                    type: "custom",
                    message: "Profile fetch error",
                })
                return
            }

            const result = await updateDescription(value, profile.id)

            if (result.success) {
                onOpenChange(false)
                router.refresh()
            }

            else {
                form.setError("description", {
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
        <div><Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormControl>
                                <Textarea
                                    placeholder="Tell us a little bit about yourself"
                                    className="resize-none min-h-24"
                                    {...field}
                                />
                            </FormControl>
                            {
                                <p className={`text-sm text-end mx-2 font-medium ${field.value.length > 200 ? "text-destructive" : "text-muted-foreground"} `}>
                                    {field.value.length}/200
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
                                <Button type="submit" disabled={!form.formState.isValid || isSubmitting} className='rounded-full p-6'>{isSubmitting ? <>
                                    <Loader2 className="mr-1 h-4 w-4 animate-spin" />Saving...
                                </> : 'Save'}</Button>
                                <DrawerClose asChild>
                                    <Button type="button" variant="redditGray" className='p-6'>
                                        Cancel
                                    </Button>
                                </DrawerClose>
                            </div>
                        )
                }
            </form>
        </Form></div>
    )
}
