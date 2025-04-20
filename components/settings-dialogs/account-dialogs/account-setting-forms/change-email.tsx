"use client"
import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { EmailStepSchema } from '@/schema'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { DialogClose } from '@/components/ui/dialog'
import { User } from '@supabase/supabase-js'
import { updateEmail } from '@/app/actions'
import { Loader2 } from 'lucide-react'
import { accountSettingsCategories } from '@/lib/settings-data'

interface ChangeEmailProps {
    user: User | null
    setCurrentCategory: React.Dispatch<React.SetStateAction<(typeof accountSettingsCategories)[0]>>
}

export default function ChangeEmail({ user, setCurrentCategory }: ChangeEmailProps) {
    const [isSubmitting, setIsSubmitting] = useState(false)

    const form = useForm<z.infer<typeof EmailStepSchema>>({
        resolver: zodResolver(EmailStepSchema),
        defaultValues: {
            email: "",
        },
    })

    async function onSubmit(values: z.infer<typeof EmailStepSchema>) {
        try {
            setIsSubmitting(true)

            if (!user) {
                form.setError("email", {
                    type: "custom",
                    message: "User not found",
                })
                return
            }

            const result = await updateEmail(values, user)

            if (result.success) {
                setCurrentCategory(
                    {
                        id: "Success",
                        name: "Check your email",
                        description:
                            <>
                                Saidit sent a confirmation email to {values.email}.<br />
                                Click the verify link in the email to secure your Saidit account.
                            </>
                    }
                )
            }

            else {
                form.setError("email", {
                    type: "custom",
                    message: "An error occurred while updating your email",
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
        <div>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <Input placeholder="New email" type='email' autoComplete='email' className='p-6' {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <div className='flex gap-2 justify-end'>
                        <DialogClose asChild>
                            <Button type="button" variant="redditGray">
                                Cancel
                            </Button>
                        </DialogClose>
                        <Button type="submit" disabled={!form.formState.isValid || isSubmitting} className='rounded-full'>{isSubmitting ? <>
                            <Loader2 className="mr-1 h-4 w-4 animate-spin" />Saving...
                        </> : 'Save'}</Button>
                    </div>
                </form>
            </Form>
        </div>
    )
}
