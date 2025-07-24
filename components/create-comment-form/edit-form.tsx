"use client"
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
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
import { useCommentRefresh } from '@/app/context/CommentRefreshContext';
import { createClient } from '@/utils/supabase/client';
import { toast } from 'sonner';

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
    slug: string
}

interface EditFormProps {
    content: string
    commentID: string,
    setShowTipTap: React.Dispatch<React.SetStateAction<boolean>>
    setNormalizedComments: React.Dispatch<React.SetStateAction<NormalizedComment[]>>
}

const EditForm = ({ content, commentID, setShowTipTap, setNormalizedComments }: EditFormProps) => {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const { triggerRefresh } = useCommentRefresh();
    const supabase = createClient()

    const form = useForm<z.infer<typeof CreateComment>>({
        resolver: zodResolver(CreateComment),
        defaultValues: {
            body: content,
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

    const updateCommentInTree = (
        comments: NormalizedComment[],
        commentId: string,
        newContent: string
    ): NormalizedComment[] => {
        return comments.map(comment => {
            if (comment.id === commentId) {
                return {
                    ...comment,
                    content: newContent
                };
            }

            if (comment.replies) {
                return {
                    ...comment,
                    replies: updateCommentInTree(comment.replies, commentId, newContent)
                };
            }

            return comment;
        });
    };


    async function onSubmit(values: z.infer<typeof CreateComment>) {
        try {
            setIsSubmitting(true)

            if (content === values.body) {
                setShowTipTap(false)
                triggerRefresh()
                return
            }

            const { error } = await supabase.from('comments').update({
                body: values.body
            }).eq('id', commentID)

            if (error) {
                toast.error("An error occurred")
            }

            else {
                setNormalizedComments(prev => updateCommentInTree(prev, commentID, values.body));
                setShowTipTap(false)
                triggerRefresh()
            }

        } catch (error) {
            console.error(error)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div>
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
                                        <TipTap form={form} showTipTap={true} setShowTipTap={setShowTipTap} isSubmittingComment={isSubmitting} isDirty={isDirty} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </form>
                </Form>
            </div>
        </div>
    );
};

export default EditForm;