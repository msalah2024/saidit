"use client"
import React, { memo, useEffect, useState } from 'react'
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
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from '../ui/button'
import { LinkPostSchema } from '@/schema'
import { Loader2 } from 'lucide-react'
import { useRouter } from 'nextjs-toploader/app'
import { useGeneralProfile } from '@/app/context/GeneralProfileContext'
import { Tables } from '@/database.types'
import { createLinkPost } from '@/app/actions'
import { toast } from 'sonner'

interface LinkFormProps {
    selectedCommunity: Tables<'communities'> | null
}

export default memo(function LinkForm({ selectedCommunity }: LinkFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const { profile } = useGeneralProfile()
    const router = useRouter()

    const form = useForm<z.infer<typeof LinkPostSchema>>({
        resolver: zodResolver(LinkPostSchema),
        defaultValues: {
            title: "",
            link: ""
        },
    })

    const { isDirty } = form.formState

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


    async function onSubmit(values: z.infer<typeof LinkPostSchema>) {
        try {
            setIsSubmitting(true)

            if (!selectedCommunity) {
                toast.error("You must select a community")
                return
            }

            if (!profile) { return }

            const result = await createLinkPost(values, profile?.account_id, selectedCommunity?.id)
            if (result.success) {
                router.push(`/s/${selectedCommunity.community_name}`)
            }
            else {
                toast.error("An error occurred trying to create your post")
                return
            }

        } catch (error) {
            console.error(error)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className='flex flex-col gap-4 my-4'>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
                    <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="ml-2 text-primary-foreground-muted">
                                    Title <span className="text-red-500">*</span>
                                </FormLabel>
                                <FormControl>
                                    <Input placeholder="Title" className="p-6 bg-card" maxLength={300} {...field} />
                                </FormControl>
                                <div className="flex mx-2 items-center justify-between">
                                    <FormMessage />
                                    <FormDescription className="ml-auto">{field.value.length}/300 characters</FormDescription>
                                </div>
                            </FormItem>

                        )}
                    />
                    <FormField
                        control={form.control}
                        name="link"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="ml-2 text-primary-foreground-muted">
                                    Link <span className="text-red-500">*</span>
                                </FormLabel>
                                <FormControl>
                                    <Input placeholder="Link" className="p-6 bg-card" {...field} />
                                </FormControl>
                                <FormMessage className='ml-2' />
                            </FormItem>
                        )}
                    />
                    <div className="flex justify-center sm:justify-end mt-4">
                        <Button type="submit" disabled={isSubmitting} className='w-full p-6 sm:mt-0 sm:p-4 sm:w-fit'>
                            {isSubmitting ? <>
                                <Loader2 className="mr-1 h-4 w-4 animate-spin" />Posting...
                            </> : 'Post'}
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    )
})
