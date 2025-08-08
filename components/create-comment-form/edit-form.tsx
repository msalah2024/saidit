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
import { NormalizedComment } from '@/complexTypes';
import { stripHTML } from '@/lib/stripHTML';

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
        newContent: string,
        strippedBody: string,
        updatedAt: string,
    ): NormalizedComment[] => {
        return comments.map(comment => {
            if (comment.id === commentId) {
                return {
                    ...comment,
                    content: newContent,
                    stripped_content: strippedBody,
                    updatedAt: updatedAt
                };
            }

            if (comment.replies) {
                return {
                    ...comment,
                    replies: updateCommentInTree(comment.replies, commentId, newContent, strippedBody, updatedAt)
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
            const strippedBody = stripHTML(values.body)


            const { error } = await supabase.from('comments').update({
                body: values.body,
                stripped_body: strippedBody,
                updated_at: new Date().toISOString()
            }).eq('id', commentID)

            if (error) {
                toast.error("An error occurred")
            }

            else {
                const now = new Date()
                const updatedAt = now.toISOString();
                setNormalizedComments(prev => updateCommentInTree(prev, commentID, values.body, strippedBody, updatedAt));
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
                                        <TipTap form={form} showTipTap={true} setShowTipTap={setShowTipTap} isSubmittingComment={isSubmitting} isDirty={isDirty} isReply={true} />
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