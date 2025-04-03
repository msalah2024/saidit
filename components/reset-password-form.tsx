import React, { useEffect, useState, useCallback } from 'react'
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
import { resetPassword } from '@/app/actions'
import { toast } from "sonner"

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
    const [countDown, setCountDown] = useState(0)
    const [isResending, setIsResending] = useState(false)
    const [resend, setResend] = useState(false)

    const identifierForm = useForm<z.infer<typeof ResetPasswordIdentifierSchema>>({
        resolver: zodResolver(ResetPasswordIdentifierSchema),
        defaultValues: {
            identifier: "",
        },
        mode: 'onBlur'
    })

    useEffect(() => {
        let timer: NodeJS.Timeout

        if (countDown > 0) {
            timer = setTimeout(() => setCountDown(countDown - 1), 1000)
        }

        return () => {
            clearTimeout(timer)
        }

    }, [countDown])

    async function onSubmit(values: z.infer<typeof ResetPasswordIdentifierSchema>) {
        try {

            setIsSubmitting(true)

            const result = await resetPassword(values)

            if (result.success) {
                setStep((prev) => prev + 1)
                setCountDown(60)
            }

            else {
                identifierForm.setError('identifier', {
                    type: 'manual',
                    message: result.message
                })
                return
            }

        } catch (error) {
            console.error(error)
        }
        finally {
            setIsSubmitting(false)
        }
    }

    const handleResend = useCallback(async () => {
        try {
            setIsResending(true)
            const result = await resetPassword(identifierForm.getValues())

            if (result.success) {
                toast.success("Email sent successfully")
                setCountDown(60)
            } else {
                toast.error(result.message)
            }

        } catch (error) {
            console.error(error)
        } finally {
            setIsResending(false)
        }

    }, [identifierForm])

    useEffect(() => {
        if (resend) {
            handleResend()
            setResend(false)
        }
    }, [handleResend, resend])

    return (
        <div>
            <DialogHeader>
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => step === 0 ? onSwitchToLogIn() : setStep(0)}
                    className="absolute top-2 left-2 p-2 h-8 w-8 hover:bg-muted"
                    aria-label="Go back"
                >
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <DialogTitle className='text-center text-2xl'>{steps[step].title}</DialogTitle>
                <DialogDescription className='text-center mb-1'>
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
                        <CheckYourEmailStep isResending={isResending} countDown={countDown} setResend={setResend} />
                    )
                }
            </div>
        </div>
    )
}
