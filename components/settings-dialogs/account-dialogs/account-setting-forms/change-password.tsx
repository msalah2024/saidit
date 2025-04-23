"use client"
import React, { useState } from 'react'
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { ResetPasswordSchema } from '@/schema'
import { updatePassword } from '@/app/actions'
import { Loader2 } from 'lucide-react'
import { DialogClose } from '@/components/ui/dialog'
import { accountSettingsCategories } from '@/lib/settings-data'
import { DrawerClose } from '@/components/ui/drawer'

interface ChangePasswordProps {
    setCurrentCategory: React.Dispatch<React.SetStateAction<(typeof accountSettingsCategories)[0]>>
    isDesktop: boolean
}

export default function ChangePassword({ setCurrentCategory, isDesktop }: ChangePasswordProps) {
    const [isSubmitting, setIsSubmitting] = useState(false)

    const form = useForm<z.infer<typeof ResetPasswordSchema>>({
        resolver: zodResolver(ResetPasswordSchema),
        defaultValues: {
            password: "",
            confirmPassword: "",
        },
    })

    async function onSubmit(values: z.infer<typeof ResetPasswordSchema>) {
        try {
            setIsSubmitting(true)
            const result = await updatePassword(values)

            if (result.success) {
                setCurrentCategory(
                    {
                        id: "Success",
                        name: "Password changed",
                        description:
                            <>
                                Your password has been changed successfully.
                            </>
                    }
                )
            }

            else {
                form.setError('password', {
                    type: 'manual',
                    message: result.message
                })
                form.setError('confirmPassword', {
                    type: 'manual',
                    message: result.message
                })
            }

        } catch (error) {
            console.error("Reset Password Error", error)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
                    <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <Input placeholder="New password" type='password' {...field} className='p-6' />
                                </FormControl>
                                <FormMessage className='ml-2' />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="confirmPassword"
                        render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <Input placeholder="Confirm new password" type='password' {...field} className='p-6' />
                                </FormControl>
                                <FormMessage className='ml-2' />
                            </FormItem>
                        )}
                    />
                    {
                        isDesktop ? (
                            <div className='flex gap-2 justify-end mt-8'>
                                <DialogClose asChild>
                                    <Button type="button" variant="redditGray">
                                        Cancel
                                    </Button>
                                </DialogClose>
                                <Button type="submit" disabled={!form.formState.isValid || isSubmitting} className='rounded-full px-6'>{isSubmitting ? <>
                                    <Loader2 className="mr-1 h-4 w-4 animate-spin" />Saving...
                                </> : 'Save'}</Button>
                            </div>) :
                            (<div className='flex flex-col gap-2 justify-end my-4'>
                                <Button type="submit" disabled={!form.formState.isValid || isSubmitting} className='rounded-full'>{isSubmitting ? <>
                                    <Loader2 className="mr-1 h-4 w-4 animate-spin" />Saving...
                                </> : 'Save'}</Button>
                                <DrawerClose asChild>
                                    <Button type="button" variant="redditGray">
                                        Cancel
                                    </Button>
                                </DrawerClose>
                            </div>)
                    }
                </form>
            </Form>
        </div>
    )
}
