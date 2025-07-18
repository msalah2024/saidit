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
import { manageCommentVotes } from '@/app/actions'

interface NormalizedComment {
    id: string;
    author: {
        username: string | null;
        avatar_url: string | null;
        verified: boolean;
    };
    creator_id: string | null,
    content: string;
    createdAt: string;
    replies?: NormalizedComment[];
    isOP?: boolean;
    comments_votes: { vote_type: 'upvote' | 'downvote', voter_id: string | null, id: string }[]
    deleted: boolean
}

interface CommentFormComponentProps {
    setShowTipTap: React.Dispatch<React.SetStateAction<boolean>>
    setNormalizedComments: React.Dispatch<React.SetStateAction<NormalizedComment[]>>
}

function CommentFormComponent({ setShowTipTap, setNormalizedComments }: CommentFormComponentProps) {
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

    async function onSubmit(values: z.infer<typeof CreateComment>) {
        try {
            if (!profile) { return }
            setIsSubmitting(true)

            const { data, error } = await supabase.from('comments').insert({
                creator_id: profile?.account_id,
                post_id: post.id,
                body: values.body,
            }).select().single()

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
                            createdAt: data.created_at,
                            replies: [],
                            isOP: profile.account_id === data.creator_id,
                            creator_id: data.creator_id,
                            comments_votes: commentVotes,
                            deleted: data.deleted
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

