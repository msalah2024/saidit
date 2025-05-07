"use client"
import React, { useState } from 'react'
import { Tables } from '@/database.types'
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { GenderStepSchema } from '@/schema'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { DialogClose } from '@/components/ui/dialog'
import { Loader2 } from 'lucide-react'
import { updateGender } from '@/app/actions'
import { useRouter } from 'next/navigation'

interface ChangeGenderProps {
    profile: Tables<'users'> | null
    onOpenChange: (open: boolean) => void
    isDesktop: boolean
}

export default function ChangeGender({ profile, onOpenChange, isDesktop }: ChangeGenderProps) {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const router = useRouter()

    const form = useForm<z.infer<typeof GenderStepSchema>>({
        resolver: zodResolver(GenderStepSchema),
        defaultValues: {
            gender: undefined,
        },
    })

    async function onSubmit(values: z.infer<typeof GenderStepSchema>) {
        try {
            setIsSubmitting(true)

            if (!profile) return

            const result = await updateGender(values, profile)

            if (result.success) {
                onOpenChange(false)
                router.refresh()
            }

            else {
                form.setError('gender', { type: 'manual', message: result.message })
            }

        } catch (error) {
            console.error("Error updating gender", error)
        } finally {
            setIsSubmitting(true)
        }
    }

    return (
        <div>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                        control={form.control}
                        name="gender"
                        render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <RadioGroup
                                        onValueChange={field.onChange}
                                        defaultValue={profile?.gender}
                                        className="flex flex-col"
                                    >
                                        <FormItem>
                                            <FormLabel className="font-normal p-4 border w-full rounded-full cursor-pointer">
                                                <FormControl>
                                                    <RadioGroupItem value="male" />
                                                </FormControl>
                                                Male
                                            </FormLabel>
                                        </FormItem>
                                        <FormItem>
                                            <FormLabel className="font-normal p-4 border w-full rounded-full cursor-pointer">
                                                <FormControl>
                                                    <RadioGroupItem value="female" />
                                                </FormControl>
                                                Female
                                            </FormLabel>
                                        </FormItem>
                                    </RadioGroup>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    {
                        isDesktop ?
                            (<div className='flex gap-2 justify-end mt-8'>
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
                                <Button type="submit" disabled={!form.formState.isValid || isSubmitting} className='rounded-full p-6'>{isSubmitting ? <>
                                    <Loader2 className="mr-1 h-4 w-4 animate-spin" />Saving...
                                </> : 'Save'}</Button>
                                <DialogClose asChild>
                                    <Button type="button" variant="redditGray" className='p-6'>
                                        Cancel
                                    </Button>
                                </DialogClose>
                            </div>)
                    }

                </form>
            </Form>
        </div>
    )
}
