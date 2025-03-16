import React from 'react'
import { UseFormReturn } from 'react-hook-form'
import { FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"

interface EmailStepProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    form: UseFormReturn<any>
}

export default function EmailStep({ form }: EmailStepProps) {
    return (
        <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
                <FormItem>
                    <FormControl>
                        <Input placeholder="Email" autoComplete='email' type='email' {...field} className='p-6' />
                    </FormControl>
                    <FormMessage className='ml-2' />
                </FormItem>
            )}
        />
    )
}
