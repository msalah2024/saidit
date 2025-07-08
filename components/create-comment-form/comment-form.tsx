"use client"
import React, { memo, useState } from 'react'
import TipTap from '../create-post-forms/TipTap'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { CreateComment } from '@/schema'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage,
} from "@/components/ui/form"
import { usePost } from '@/app/context/PostContext'
import { useGeneralProfile } from '@/app/context/GeneralProfileContext'
import { createClient } from '@/utils/supabase/client'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface CommentFormComponentProps {
    setShowTipTap: React.Dispatch<React.SetStateAction<boolean>>
}

function CommentFormComponent({ setShowTipTap }: CommentFormComponentProps) {
    const { post } = usePost()
    const { profile } = useGeneralProfile()
    const router = useRouter()
    const supabase = createClient()

    const [isSubmitting, setIsSubmitting] = useState(false)

    const form = useForm<z.infer<typeof CreateComment>>({
        resolver: zodResolver(CreateComment),
        defaultValues: {
            body: "",
        },
    })

    async function onSubmit(values: z.infer<typeof CreateComment>) {
        try {
            setIsSubmitting(true)

            const { error } = await supabase.from('comments').insert({
                creator_id: profile?.account_id,
                post_id: post.id,
                body: values.body,
            })

            if (error) {
                toast.error("An error occurred")
            }

            else {
                setShowTipTap(false)
                router.refresh()
            }

            console.log(values)
        } catch (error) {
            console.error(error)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <FormField
                        control={form.control}
                        name="body"
                        render={() => (
                            <FormItem>
                                <FormControl>
                                    <TipTap form={form} setShowTipTap={setShowTipTap} isSubmittingComment={isSubmitting} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </form>
            </Form>
        </div>
    )
}

const CommentForm = memo(CommentFormComponent);
export default CommentForm;
