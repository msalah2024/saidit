"use client"
import React from 'react'
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


export default function ChangeEmail() {

    const form = useForm<z.infer<typeof EmailStepSchema>>({
        resolver: zodResolver(EmailStepSchema),
        defaultValues: {
            email: "",
        },
    })

    function onSubmit(values: z.infer<typeof EmailStepSchema>) {
        console.log(values)
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
                        <Button type="submit" disabled={!form.formState.isValid} className='rounded-full'>Save</Button>
                    </div>
                </form>
            </Form>
        </div>
    )
}
