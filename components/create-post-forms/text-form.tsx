"use client"
import React from 'react'
import TipTap from './TipTap'
import { Tables } from '@/database.types'
import SelectCommunity from '../SelectCommunity'
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { TextPostSchema } from "@/schema"
import { Button } from '../ui/button'

interface TextContentFormProps {
    selectedCommunity: Tables<'communities'> | null
    setSelectedCommunity: React.Dispatch<React.SetStateAction<Tables<'communities'> | null>>
}

export default function TextForm({ selectedCommunity, setSelectedCommunity }: TextContentFormProps) {
    const form = useForm<z.infer<typeof TextPostSchema>>({
        resolver: zodResolver(TextPostSchema),
        defaultValues: {
            title: "",
            body: "<p></p>",
        },
    })

    function onSubmit(values: z.infer<typeof TextPostSchema>) {
        // Do something with the form values.
        // ✅ This will be type-safe and validated.
        console.log(values)
    }

    return (
        <div className='flex flex-col gap-4 my-4'>
            <SelectCommunity selectedCommunity={selectedCommunity} setSelectedCommunity={setSelectedCommunity} />
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2 mt-2">
                    <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="ml-2 text-primary-foreground-muted">
                                    Title <span className="text-red-500">*</span>
                                </FormLabel>
                                <FormControl>
                                    <Input placeholder="Title" className="p-6 bg-card" maxLength={300} {...field} />
                                </FormControl>
                                <div className="flex mx-2 items-center justify-between">
                                    <FormMessage />
                                    <FormDescription className="ml-auto">{field.value.length}/300 characters</FormDescription>
                                </div>
                            </FormItem>

                        )}
                    />
                    <FormField
                        control={form.control}
                        name="body"
                        render={() => (
                            <FormItem>
                                <FormLabel className="ml-2 text-primary-foreground-muted">
                                    Content
                                </FormLabel>
                                <FormControl>
                                    <TipTap form={form} />
                                </FormControl>
                                <div className="flex mx-2 items-center justify-between">
                                    <FormMessage />
                                </div>
                            </FormItem>

                        )}
                    />
                    <div className="flex justify-end">
                        <Button type="submit">Post</Button>
                    </div>
                </form>
            </Form>
        </div>
    )
}
