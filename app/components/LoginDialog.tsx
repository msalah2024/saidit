"use client";

import React from 'react'
import Image from 'next/image';
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { LoginSchema } from '@/schema/index';
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"

import googleLogo from "@/app/images/googleIcon.svg"
import discordLogo from "@/app/images/discordIcon.svg"
import Link from 'next/link';

export default function LoginDialog() {

    const LoginForm = useForm({
        resolver: zodResolver(LoginSchema),
        defaultValues: {
            username: "",
            password: ""
        }
    })

    const onSubmit = (data: z.infer<typeof LoginSchema>) => {
        console.log(data)
    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button>Log In</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle><div className='text-center'>
                        <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
                            Log In
                        </h3>
                    </div></DialogTitle>
                    <DialogDescription className='text-center mb-2'>
                        By continuing, you acknowledge that you understand and accept Saidit&apos;s terms and policies (coming soon).
                    </DialogDescription>
                    <Button className='w-full p-6 rounded-4xl text-black bg-white hover:bg-white'>
                        <Image src={googleLogo} alt="Google Logo" width={20} height={20} draggable={false} className="select-none" />
                        Continue with Google
                    </Button>
                    <Button className='w-full p-6 rounded-4xl text-black bg-white hover:bg-white'>
                        <Image src={discordLogo} alt="Discord Logo" width={22} height={22} draggable={false} className="select-none" />
                        Continue with Discord
                    </Button>
                </DialogHeader>
                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t"></span>
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">Or</span>
                    </div>
                </div>
                <div className="grid gap-4">
                    <Form {...LoginForm}>
                        <form onSubmit={LoginForm.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={LoginForm.control}
                                name="username"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormControl>
                                            <Input placeholder="Email or username" type='text' {...field} className='p-6 rounded-2xl' />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={LoginForm.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormControl>
                                            <Input placeholder="Password" type='password' {...field} className='p-6 rounded-2xl' />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className='flex flex-col gap-2 ml-2'>
                                <Link href="/forgot-password">
                                    <small className="text-sm leading-none text-secondary">Forgot password?</small>
                                </Link>
                                <div>
                                    <small className="text-sm leading-none ">New to Saidit?</small>
                                    <Link href="/register">
                                        <small className="text-sm leading-none text-secondary">{" "}Sign Up</small>
                                    </Link>
                                </div>

                            </div>
                            <Button type="submit" className='w-full p-6 rounded-4xl'>Log In</Button>
                        </form>
                    </Form>
                </div>
            </DialogContent>
        </Dialog>
    )
}
