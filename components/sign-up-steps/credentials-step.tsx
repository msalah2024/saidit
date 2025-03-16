import React from 'react'
import { UseFormReturn } from 'react-hook-form'
import { FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"

interface CredentialsStepProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    form: UseFormReturn<any>
}

export default function CredentialsStep({ form }: CredentialsStepProps) {
    return (
        <div className='space-y-4'>
            <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                    <FormItem>
                        <FormControl>
                            <Input placeholder="Username" autoComplete='username' type='text' {...field} className='p-6' />
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
                            <Input placeholder="Password" autoComplete='new-password' type='password' {...field} className='p-6' />
                        </FormControl>
                        <FormMessage className='ml-2' />
                    </FormItem>
                )}
            />
        </div>
    )
}
