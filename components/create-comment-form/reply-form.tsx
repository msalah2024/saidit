"use client"
import React, { memo, useLayoutEffect, useRef, useState } from 'react'
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
import { useCommentRefresh } from '@/app/context/CommentRefreshContext'
import { manageCommentVotes } from '@/app/actions'

interface NormalizedComment {
    id: string;
    author: {
        username: string | null;
        avatar_url: string | null;
        verified: boolean;
    };
    content: string;
    createdAt: string;
    replies?: NormalizedComment[];
    isOP?: boolean;
    comments_votes: { vote_type: 'upvote' | 'downvote' | null, voter_id: string | null, id: string }[]
}

interface ReplyFormComponentProps {
    setShowTipTap: React.Dispatch<React.SetStateAction<boolean>>
    parentID: string
    replies?: NormalizedComment[];
}

function ReplyFormComponent({ setShowTipTap, parentID, replies }: ReplyFormComponentProps) {
    const { post } = usePost()
    const { profile } = useGeneralProfile()
    const supabase = createClient()

    const { triggerRefresh } = useCommentRefresh();

    const [isSubmitting, setIsSubmitting] = useState(false)

    const form = useForm<z.infer<typeof CreateComment>>({
        resolver: zodResolver(CreateComment),
        defaultValues: {
            body: "",
        },
    })

    const formRef = useRef<HTMLFormElement>(null);

    useLayoutEffect(() => {
        if (!formRef.current) return;
        let prevHeight = formRef.current.offsetHeight;
        const observer = new ResizeObserver(entries => {
            for (const entry of entries) {
                const newHeight = entry.target.clientHeight;
                if (newHeight !== prevHeight) {
                    prevHeight = newHeight;
                    triggerRefresh();
                }
            }
        });
        observer.observe(formRef.current);
        return () => observer.disconnect();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [formRef.current, triggerRefresh]);

    async function onSubmit(values: z.infer<typeof CreateComment>) {
        try {
            if (!profile) { return }
            setIsSubmitting(true)

            const { data, error } = await supabase.from('comments').insert({
                creator_id: profile?.account_id,
                post_id: post.id,
                parent_id: parentID,
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
                        const newReply: NormalizedComment = {
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
                            comments_votes: commentVotes
                        }
                        replies?.unshift(newReply)
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
                <form
                    ref={formRef}
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-8"
                >
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

const ReplyForm = memo(ReplyFormComponent);
export default ReplyForm;
