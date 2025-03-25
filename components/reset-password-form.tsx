import React, { useState } from 'react'
import {
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Form,
} from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Loader2 } from "lucide-react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { ResetPasswordIdentifierSchema } from '@/schema'
import EmailStep from './reset-password-steps/email-step'
import CheckYourEmailStep from './reset-password-steps/check-your-email-step'

interface ResetPasswordFormProps {
    onSwitchToLogIn: () => void
}

const steps = [
    {
        title: "Reset your password",
        description: "Enter your email address or username and we’ll send you a link to reset your password",
    },
    {
        title: "Check your inbox",
        description: "An email with a link to reset your password was sent to the email address associated with your account"
    }
]

export default function ResetPasswordForm({ onSwitchToLogIn }: ResetPasswordFormProps) {
    const [step, setStep] = useState(0)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const identifierForm = useForm<z.infer<typeof ResetPasswordIdentifierSchema>>({
        resolver: zodResolver(ResetPasswordIdentifierSchema),
        defaultValues: {
            identifier: "",
        },
        mode: 'onBlur'
    })

    function onSubmit(values: z.infer<typeof ResetPasswordIdentifierSchema>) {
        // Do something with the form values.
        // ✅ This will be type-safe and validated.
        try {
            setIsSubmitting(true)
            setStep((prev) => prev + 1)
            console.log(values)
        } catch (error) {
            console.error(error)
        }
        finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div>
            <DialogHeader>
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => onSwitchToLogIn()}
                    className="absolute top-2 left-2 p-2 h-8 w-8 hover:bg-muted"
                    aria-label="Go back"
                >
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <DialogTitle className='text-center text-2xl'>{steps[step].title}</DialogTitle>
                <DialogDescription className='text-center'>
                    {steps[step].description}
                </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                {
                    step === 0 ? (
                        <Form {...identifierForm}>
                            <form onSubmit={identifierForm.handleSubmit(onSubmit)} className="space-y-3">
                                <EmailStep form={identifierForm} />
                                <Button type='submit' disabled={!identifierForm.formState.isValid || isSubmitting} className='p-6 w-full rounded-3xl mt-3'>
                                    {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Sending email...</> : 'Reset password'}
                                </Button>
                            </form>
                        </Form>
                    ) : (
                        <CheckYourEmailStep />
                    )
                }
            </div>
        </div>
    )
}
