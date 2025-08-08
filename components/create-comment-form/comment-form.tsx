"use client"
import React, { memo, useEffect, useState } from 'react'
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
import { generateSlug, manageCommentVotes } from '@/app/actions'
import { stripHTML } from '@/lib/stripHTML'
import { NormalizedComment } from '@/complexTypes'

interface CommentFormComponentProps {
    setShowTipTap: React.Dispatch<React.SetStateAction<boolean>>
    setNormalizedComments: React.Dispatch<React.SetStateAction<NormalizedComment[]>>
    showTipTap?: boolean
}

function CommentFormComponent({ setShowTipTap, showTipTap, setNormalizedComments }: CommentFormComponentProps) {
    const { post } = usePost()
    const { profile } = useGeneralProfile()
    const supabase = createClient()

    const [isSubmitting, setIsSubmitting] = useState(false)

    const form = useForm<z.infer<typeof CreateComment>>({
        resolver: zodResolver(CreateComment),
        defaultValues: {
            body: "",
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

    async function onSubmit(values: z.infer<typeof CreateComment>) {
        try {
            if (!profile) { return }
            if (values.body === "" || values.body === "<p></p>") {
                form.setError('body', {
                    type: 'manual',
                    message: 'The field is required and cannot be empty'
                })
                return
            }
            setIsSubmitting(true)

            const slug = await generateSlug(values.body)
            const strippedBody = stripHTML(values.body)

            const { data, error } = await supabase.from('comments').insert({
                creator_id: profile?.account_id,
                post_id: post.id,
                body: values.body,
                stripped_body: strippedBody,
                slug: slug
            }).select().single()
            console.log(data)
            if (error) {
                toast.error("An error occurred")
            }

            else {
                const result = await manageCommentVotes(profile?.account_id, data.id, 'upvote')
                if (!result.success) {
                    toast.error("An error occurred")
                }
                else {
                    const { data: commentVotes, error } = await supabase.from('comments_votes').select('id, vote_type, voter_id').eq('comment_id', data.id)

                    if (error) {
                        toast.error("An error occurred")
                    }
                    else {
                        setShowTipTap(false)
                        const newComment: NormalizedComment = {
                            id: data.id,
                            author: {
                                username: profile.username ?? null,
                                avatar_url: profile.avatar_url ?? null,
                                verified: profile.verified ?? false,
                            },
                            content: data.body || "",
                            stripped_content: data.stripped_body || "",
                            createdAt: data.created_at,
                            updatedAt: data.updated_at,
                            replies: [],
                            isOP: profile.account_id === data.creator_id,
                            creator_id: data.creator_id,
                            comments_votes: commentVotes,
                            deleted: data.deleted,
                            slug: data.slug
                        }
                        setNormalizedComments(prev => [newComment, ...prev])
                    }
                }
            }
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
                                    <TipTap form={form} showTipTap={showTipTap} setShowTipTap={setShowTipTap} isSubmittingComment={isSubmitting} isDirty={isDirty} />
                                </FormControl>
                                <FormMessage className='ml-2' />
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

