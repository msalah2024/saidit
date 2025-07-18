"use client"
import React, { useEffect, useState } from 'react'
import TipTap from './TipTap'
import { Tables } from '@/database.types'
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
import { useGeneralProfile } from '@/app/context/GeneralProfileContext'
import { Loader2 } from 'lucide-react'
import { toast } from "sonner"
import { useRouter } from 'nextjs-toploader/app'
import { ImagePostSchema } from '@/schema'
import ImagesManagement from './images-management'
import { createClient } from '@/utils/supabase/client'
import { generatePostSlug } from '@/app/actions'

interface ImagesFormProps {
    selectedCommunity: Tables<'communities'> | null
}

export default function ImagesForm({ selectedCommunity }: ImagesFormProps) {
    const supabase = createClient()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const { user } = useGeneralProfile()
    const router = useRouter()
    const form = useForm<z.infer<typeof ImagePostSchema>>({
        resolver: zodResolver(ImagePostSchema),
        defaultValues: {
            title: "",
            body: "<p></p>",
            images: []
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

    async function onSubmit(values: z.infer<typeof ImagePostSchema>) {

        if (!selectedCommunity) {
            toast.error("You must select a community")
            return
        }

        try {
            setIsSubmitting(true)



            if (!user) { return }

            const slug = await generatePostSlug(values.title)
            const { data: post, error } = await supabase.from('posts').insert({
                community_id: selectedCommunity.id,
                author_id: user.id,
                title: values.title,
                content: values.body,
                post_type: 'image',
                slug: slug
            }).select('*').single()

            if (error) {
                console.error("Create post error", error.message)
                toast.error(error.message)
                return
            }

            else {
                for (const imgObject of values.images) {
                    const file = imgObject.image;
                    const fileExt = file.name.split('.').pop();
                    const fileName = `${user?.id}/posts/${post.id}/${Date.now()}.${fileExt}`

                    const { error } = await supabase
                        .storage
                        .from('saidit')
                        .update(fileName, file, {
                            contentType: `image/${fileExt}`,
                            upsert: true
                        })

                    if (error) {
                        console.error("Create post error", error.message)
                        toast.error(error.message)
                        return
                    }

                    else {
                        const { data } = supabase.storage.from('saidit').getPublicUrl(fileName)
                        const { error } = await supabase.from('post_attachments').insert({
                            post_id: post.id,
                            file_url: data.publicUrl,
                            width: imgObject.width,
                            height: imgObject.height,
                            alt_text: imgObject.alt,
                            caption: imgObject.caption
                        })

                        if (error) {
                            console.error("Upload image details error", error.message)
                            toast.error(error.message)
                            return
                        }
                    }
                }

                router.push(`/s/${selectedCommunity.community_name}`)
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
                        name="images"
                        render={() => (
                            <FormItem>
                                <FormLabel className="ml-2 text-primary-foreground-muted">
                                    Images <span className="text-red-500">*</span>
                                </FormLabel>
                                <FormControl>
                                    <ImagesManagement form={form} />
                                </FormControl>
                                <div className="flex mx-2 items-center justify-between">
                                    <FormMessage />
                                </div>
                            </FormItem>

                        )}
                    />
                    <FormField
                        control={form.control}
                        name="body"
                        render={() => (
                            <FormItem>
                                <FormLabel className="ml-2 mt-2 text-primary-foreground-muted">
                                    Content
                                </FormLabel>
                                <FormControl>
                                    <TipTap form={form} />
                                </FormControl>
                                <div className="flex mx-2 items-center justify-between">
                                    <FormMessage />
                                </div>
                            </FormItem>

                        )}
                    />
                    <div className="flex justify-center sm:justify-end">
                        <Button type="submit" disabled={isSubmitting} className='w-full mt-2 p-6 sm:mt-0 sm:p-4 sm:w-fit'>
                            {isSubmitting ? <>
                                <Loader2 className="mr-1 h-4 w-4 animate-spin" />Posting...
                            </> : 'Post'}
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    )
}
