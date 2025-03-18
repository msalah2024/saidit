import React from 'react'
import { UseFormReturn } from 'react-hook-form'
import { FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

interface GenderStepProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    form: UseFormReturn<any>
}

export default function GenderStep({ form }: GenderStepProps) {
    return (
        <FormField
            control={form.control}
            name="gender"
            render={({ field }) => (
                <FormItem>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl className='w-full p-6'>
                            <SelectTrigger>
                                <SelectValue placeholder="Select your Gender" />
                            </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            <SelectItem value="male" className='p-2'>male</SelectItem>
                            <SelectItem value="female" className='p-2'>female</SelectItem>
                        </SelectContent>
                    </Select>
                    <FormMessage className='ml-2'/>
                </FormItem>
            )}
        />
    )
}
