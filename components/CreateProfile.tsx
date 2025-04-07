"use client"

import React, { useState } from 'react'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {
    Form,
} from "@/components/ui/form"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    CreateProfileUserNameSchema,
    CreateProfileGenderSchema,
    CreateProfileSchema
} from '@/schema'
import { Loader2 } from 'lucide-react'
import { isUserNameAvailable, createProfile } from '@/app/actions'
import { User } from '@supabase/supabase-js'
import UserNameStep from './create-profile-steps/user-name-step'
import GenderStep from './create-profile-steps/gender-step'

interface CreateProfileProps {
    user: User | null;
}

const steps = [
    {
        title: "Create your username",
        description:
            "Saidit is anonymous, so your username is what you'll go by here. Choose wisely—because once you get a name, you can't change it.",
    },
    { title: "Select your Gender", description: "This will be used for content recommendation" },
]

export default function CreateProfile({ user }: CreateProfileProps) {
    const [open, setOpen] = useState(true)
    const [step, setStep] = useState(0)
    const [isChecking, setIsChecking] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const userNameForm = useForm<z.infer<typeof CreateProfileUserNameSchema>>({
        resolver: zodResolver(CreateProfileUserNameSchema),
        defaultValues: {
            username: "",
        },
        mode: "onBlur",
    })

    const genderForm = useForm<z.infer<typeof CreateProfileGenderSchema>>({
        resolver: zodResolver(CreateProfileGenderSchema),
        defaultValues: {
            gender: undefined,
        },
        mode: "onBlur",
    })

    const profileForm = useForm<z.infer<typeof CreateProfileSchema>>({
        resolver: zodResolver(CreateProfileSchema),
        defaultValues: {
            username: "",
            gender: undefined,
        },
    })

    async function onUserNameSubmit(values: z.infer<typeof CreateProfileUserNameSchema>) {

        try {

            setIsChecking(true)
            const result = await isUserNameAvailable(values)

            if (result.success) {
                profileForm.setValue('username', values.username)
                setStep((prev) => prev + 1)
            }
            else {
                userNameForm.setError('username', {
                    type: 'manual',
                    message: result.message
                })
                return
            }

        } catch (error) {
            console.error(error)
        } finally {
            setIsChecking(false)
        }
    }

    function onGenderSubmit(values: z.infer<typeof CreateProfileGenderSchema>) {
        try {
            profileForm.setValue('gender', values.gender)
            onSubmit(profileForm.getValues())
        } catch (error) {
            console.error(error)
        }
    }

    async function onSubmit(values: z.infer<typeof CreateProfileSchema>) {
        try {
            setIsSubmitting(true)

            if (!user) {
                throw new Error("User is not authenticated");
            }

            const result = await createProfile(values, user)

            if (result.success) {
                setOpen(false)
            }
            else {
                profileForm.setError('gender', {
                    type: 'manual',
                    message: result.message
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
        <Dialog open={open}>
            <DialogContent className="sm:max-w-[425px] [&>button]:hidden [&>button[aria-label='Close']]:hidden [&_svg]:hidden">
                <DialogHeader>
                    <DialogTitle className='text-center text-2xl'>{steps[step].title}</DialogTitle>
                    <DialogDescription className='text-center'>
                        {steps[step].description}
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    {
                        step === 0 ? (
                            <Form {...userNameForm}>
                                <form onSubmit={userNameForm.handleSubmit(onUserNameSubmit)} className="space-y-3">
                                    <UserNameStep form={userNameForm} />
                                    <Button type='submit' disabled={!userNameForm.formState.isValid} className='p-6 w-full rounded-3xl mt-3'>{
                                        isChecking ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Checking...
                                        </> : 'Continue'
                                    }</Button>
                                </form>
                            </Form>
                        ) : step === 1 ? (
                            <Form {...genderForm}>
                                <form onSubmit={genderForm.handleSubmit(onGenderSubmit)} className="space-y-3">
                                    <GenderStep form={genderForm} />
                                    <Button type='submit' disabled={!genderForm.formState.isValid} className='p-6 w-full rounded-3xl mt-3'>{
                                        isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Creating Profile...
                                        </> : 'Create Profile'
                                    }</Button>
                                </form>
                            </Form>
                        ) : null
                    }
                </div>
            </DialogContent>
        </Dialog>

    )
}
