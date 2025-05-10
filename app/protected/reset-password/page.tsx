"use client"
import React, { useState } from 'react'
import { useRouter } from 'nextjs-toploader/app'
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
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
import { toast } from "sonner"
import { updatePassword } from '@/app/actions'
import { Loader2 } from 'lucide-react'

export default function Page() {
    const router = useRouter()
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
                toast.success("Password reset successfully")
                router.push('/')
            }

            else {
                form.setError('password', {
                    type: 'manual',
                })
                form.setError('confirmPassword', {
                    type: 'manual',
                })
                toast.error(result.message)
            }

        } catch (error) {
            console.error("Reset Password Error", error)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className='h-[calc(100vh-56px)] patternBG flex items-center justify-center'>
            <Card className="w-[90%] max-w-[500px] bg-background">
                <CardHeader>
                    <CardTitle className='text-2xl text-center'>Reset your password</CardTitle>
                </CardHeader>
                <CardContent>
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
                            <div className='flex w-full mt-7 justify-center items-center'>
                                <small className="text-sm text-center text-muted-foreground  leading-none">Resetting your password will log you out on all devices.</small>
                            </div>
                            <Button type="submit" disabled={isSubmitting} className='p-6 w-full rounded-3xl'>
                                {
                                    isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Resetting password...
                                    </> : 'Continue'
                                }
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    )
}
