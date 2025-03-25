"use client"
import React, { useState } from 'react'
import Link from 'next/link'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import {
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import Image from 'next/image'
import discordLogo from "@/public/assets/images/discordIcon.svg"
import googleLogo from "@/public/assets/images/googleIcon.svg"
import { LoginSchema } from '@/schema'
import { logIn } from '@/app/actions'
import { Loader2 } from 'lucide-react'


interface SignInFormProps {
    onSwitchToSignUp: () => void
    onSwitchToResetPassword: () => void
    setOpen: (value: boolean) => void
}


export default function LogInForm({ onSwitchToSignUp, onSwitchToResetPassword, setOpen }: SignInFormProps) {
    const [isLoginIn, setIsLoginIn] = useState(false)

    const form = useForm<z.infer<typeof LoginSchema>>({
        resolver: zodResolver(LoginSchema),
        defaultValues: {
            identifier: "",
            password: "",
        },
    })

    async function onSubmit(values: z.infer<typeof LoginSchema>) {
        try {
            setIsLoginIn(true)

            const result = await logIn(values)

            if (result.success) {
                setOpen(false)
            }
            else {
                form.setError('identifier', {
                    type: 'manual',
                })
                form.setError('password', {
                    type: 'manual',
                    message: result.message
                })

            }

        } catch (error) {
            console.error(error)
        } finally {
            setIsLoginIn(false)
        }
    }

    return (
        <div>
            <DialogHeader>
                <DialogTitle className='text-center text-2xl'>Log In</DialogTitle>
                <DialogDescription className='text-center'>
                    By continuing, you acknowledge that you understand and accept Saidit&apos;s terms and policies (coming soon).
                </DialogDescription>
                <div className='flex flex-col gap-2 w-full mt-2'>
                    <Button className='bg-white hover:bg-white text-background p-6 rounded-3xl'><Image src={googleLogo} alt='googleLogo' width={18} height={18}></Image> Continue with Google</Button>
                    <Button className='bg-white hover:bg-white text-background p-6 rounded-3xl'><Image src={discordLogo} alt='discordLogo' width={18} height={18}></Image> Continue with Discord</Button>
                </div>
                <div className="relative mt-2">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t"></span>
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">Or</span>
                    </div>
                </div>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
                        <FormField
                            control={form.control}
                            name="identifier"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <Input placeholder="Email or username" autoComplete='username' type='text' {...field} className='p-6' />
                                    </FormControl>
                                    <FormMessage className='ml-2' />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <Input placeholder="Password" autoComplete='current-password' type='password' {...field} className='p-6' />
                                    </FormControl>
                                    <FormMessage className='ml-2' />
                                </FormItem>
                            )}
                        />
                        <div className='ml-2 mb-6'>
                            <Link href='#' onClick={onSwitchToResetPassword} className='text-sm text-accent'>Forgot password?</Link>
                            <div className='space-x-1'>
                                <small className="text-sm font-medium leading-none">New to Saidit?</small>
                                <Link href="#" className='text-sm text-accent' onClick={onSwitchToSignUp}>Sign Up</Link>
                            </div>
                        </div>
                        <Button type='submit' className='p-6 w-full rounded-3xl'>{
                            isLoginIn ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Login In...
                            </> : 'Log In'
                        }</Button>
                    </form>
                </Form>
            </div>
        </div>
    )
}
