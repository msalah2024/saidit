import React, { useState } from 'react'
import { User } from '@supabase/supabase-js'
import { accountSettingsCategories } from '@/lib/settings-data'
import { ResetPasswordIdentifierSchema } from '@/schema'
import { resetPassword } from '@/app/actions'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from "@/components/ui/button"
import { Loader2 } from 'lucide-react'
import { DialogClose } from '@/components/ui/dialog'
import { DrawerClose } from '@/components/ui/drawer'
import { toast } from 'sonner'

interface CreatePasswordProps {
    user: User | null
    setCurrentCategory: (category: (typeof accountSettingsCategories)[0]) => void
    isDesktop: boolean
}

export default function CreatePassword({ user, setCurrentCategory, isDesktop }: CreatePasswordProps) {
    const [isSubmitting, setIsSubmitting] = useState(false)

    const identifierForm = useForm<z.infer<typeof ResetPasswordIdentifierSchema>>({
        resolver: zodResolver(ResetPasswordIdentifierSchema),
        defaultValues: {
            identifier: "",
        },
        mode: 'onBlur'
    })

    async function onSubmit() {
        try {
            setIsSubmitting(true)

            if (!user) {
                return
            }

            const values = user?.email ? { identifier: user.email } : identifierForm.getValues()
            const result = await resetPassword(values)

            if (result.success) {
                setCurrentCategory({
                    id: "Check your email",
                    name: "Check your email",
                    description: "An email with a link to reset your password was sent to the email address associated with your account",
                })
            }

            else {
                toast.error(result.message)
                return
            }

        } catch (error) {
            console.error(error)
        }
        finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div>
            {
                isDesktop ?
                    (<div className='flex gap-2 justify-end mt-8'>
                        <DialogClose asChild>
                            <Button type="button" variant="redditGray">
                                Cancel
                            </Button>
                        </DialogClose>
                        <Button disabled={isSubmitting} onClick={onSubmit} className='rounded-full px-6'>{isSubmitting ? <>
                            <Loader2 className="mr-1 h-4 w-4 animate-spin" />Continue...
                        </> : 'Continue'}</Button>
                    </div>) :
                    (
                        <div className='flex flex-col gap-2 justify-end my-4'>
                            <Button disabled={isSubmitting} onClick={onSubmit} className='rounded-full p-6'>{isSubmitting ? <>
                                <Loader2 className="mr-1 h-4 w-4 animate-spin" />Continue...
                            </> : 'Continue'}</Button>
                            <DrawerClose asChild>
                                <Button type="button" variant="redditGray" className='p-6'>
                                    Cancel
                                </Button>
                            </DrawerClose>
                        </div>
                    )
            }
        </div>
    )
}

