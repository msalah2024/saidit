import React from 'react'
import { UseFormReturn } from 'react-hook-form'
import { FormControl, FormField, FormItem, FormMessage, FormDescription } from "@/components/ui/form"
import { Input } from "@/components/ui/input"

interface UserNameStepProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    form: UseFormReturn<any>
}

export default function UserNameStep({ form }: UserNameStepProps) {
    return (
        <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
                <FormItem>
                    <FormControl>
                        <Input placeholder="Username" type='text' {...field} className='p-6' />
                    </FormControl>
                    <FormDescription className='ml-2'>This will be your public name on Saidit</FormDescription>
                    <FormMessage className='ml-2' />
                </FormItem>
            )}
        />
    )
}
