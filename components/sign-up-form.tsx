"use client"
import React, { useState } from 'react'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import Link from 'next/link'
import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
  Form,
} from "@/components/ui/form"
import { ArrowLeft, Loader2 } from "lucide-react"
import Image from 'next/image'
import discordLogo from "@/public/assets/images/discordIcon.svg"
import googleLogo from "@/public/assets/images/googleIcon.svg"
import EmailStep from './sign-up-steps/email-step'
import CredentialsStep from './sign-up-steps/credentials-step'
import GenderStep from './sign-up-steps/gender-step'
import SuccessStep from './sign-up-steps/success-step'
import { RegisterSchema } from '@/schema'
import { EmailStepSchema } from '@/schema'
import { CredentialsStepSchema } from '@/schema'
import { GenderStepSchema } from '@/schema'
import { isEmailAvailable, isUserNameAvailable, signUp } from '@/app/actions'

interface SignUpFormProps {
  onSwitchToLogIn: () => void
}

const steps = [
  {
    title: "Sign Up",
    description:
      "By continuing, you acknowledge that you understand and accept Saidit's terms and policies (coming soon).",
  },
  {
    title: "Create your username and password",
    description:
      "Saidit is anonymous, so your username is what you'll go by here. Choose wisely—because once you get a name, you can't change it.",
  },
  { title: "Select your Gender", description: "This will be used for content recommendation" },
  { title: "Success", description: "Your account has been created" },
]

export default function SignUpForm({ onSwitchToLogIn }: SignUpFormProps) {
  const [step, setStep] = useState(0)
  const [isChecking, setIsChecking] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<z.infer<typeof RegisterSchema>>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      gender: undefined,
    },
  })

  const emailForm = useForm<z.infer<typeof EmailStepSchema>>({
    resolver: zodResolver(EmailStepSchema),
    defaultValues: {
      email: "",
    },
    mode: 'onBlur'
  })

  const credentialsForm = useForm<z.infer<typeof CredentialsStepSchema>>({
    resolver: zodResolver(CredentialsStepSchema),
    defaultValues: {
      username: "",
      password: "",
    },
    mode: 'onBlur'
  })

  const genderForm = useForm<z.infer<typeof GenderStepSchema>>({
    resolver: zodResolver(GenderStepSchema),
    defaultValues: {
      gender: undefined,
    }
  })

  async function onEmailSubmit(values: z.infer<typeof EmailStepSchema>) {

    try {

      setIsChecking(true)

      const result = await isEmailAvailable(values)
      console.log(result)

      if (result.success) {
        form.setValue('email', values.email)
        setStep((prev) => prev + 1)
      }
      else {
        emailForm.setError('email', {
          type: 'manual',
          message: 'Email is already taken'
        })
        return
      }

    } catch (error) {
      console.error(error)
    } finally {
      setIsChecking(false)
    }
  }

  async function onCredentialsSubmit(values: z.infer<typeof CredentialsStepSchema>) {

    try {

      setIsChecking(true)

      const result = await isUserNameAvailable(values)
      console.log(result)

      if (result.success) {
        form.setValue('username', values.username)
        form.setValue('password', values.password)
        setStep((prev) => prev + 1)
      }
      else {
        credentialsForm.setError('username', {
          type: 'manual',
          message: 'Username is already taken'
        })
        return
      }

    } catch (error) {
      console.error(error)
    } finally {
      setIsChecking(false)
    }
  }

  function onGenderSubmit(values: z.infer<typeof GenderStepSchema>) {

    try {

      form.setValue('gender', values.gender)
      onSubmit(form.getValues())

    }
    catch (error) {
      console.error(error)
    }
  }

  async function onSubmit(values: z.infer<typeof RegisterSchema>) {

    try {

      setIsSubmitting(true)

      const result = await signUp(values)

      if (result.success) {
        setStep((prev) => prev + 1)
      }
      else {
        genderForm.setError('gender', {
          type: 'manual',
          message: "An error occurred"
        })
        return
      }

    } catch (error) {
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div>
      <DialogHeader>
        {step > 0 && step < steps.length - 1 && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setStep((prev) => prev - 1)}
            className="absolute top-2 left-2 p-2 h-8 w-8 hover:bg-muted"
            aria-label="Go back"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
        )}
        <DialogTitle className='text-center text-2xl'>{steps[step].title}</DialogTitle>
        <DialogDescription className='text-center'>
          {steps[step].description}
        </DialogDescription>
        {
          step === 0 && (
            <div>
              <div className='flex flex-col gap-2 w-full mt-2'>
                <Button className='bg-white hover:bg-white text-black p-6 rounded-3xl'><Image src={googleLogo} alt='googleLogo' width={18} height={18}></Image> Continue with Google</Button>
                <Button className='bg-white hover:bg-white text-black p-6 rounded-3xl'><Image src={discordLogo} alt='discordLogo' width={18} height={18}></Image> Continue with Discord</Button>
              </div>
              <div className="relative mt-2">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t"></span>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or</span>
                </div>
              </div>
            </div>
          )
        }
      </DialogHeader>
      <div className="grid gap-4 py-4">
        {
          step === 0 ? (
            <Form {...emailForm}>
              <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="space-y-3">
                <EmailStep form={emailForm} />
                <div className='ml-2 mb-6'>
                  <div className='space-x-1'>
                    <small className="text-sm font-medium leading-none">Already a Saiditor?</small>
                    <Link href="#" className='text-sm text-secondary' onClick={onSwitchToLogIn}>Log In</Link>
                  </div>
                </div>
                <Button type='submit' disabled={!emailForm.formState.isValid || isChecking} className='p-6 w-full rounded-3xl mt-3'>
                  {isChecking ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Checking...</> : 'Continue'}
                </Button>
              </form>
            </Form>
          ) : step === 1 ? (
            <Form {...credentialsForm}>
              <form onSubmit={credentialsForm.handleSubmit(onCredentialsSubmit)} className="space-y-3">
                <CredentialsStep form={credentialsForm} />
                <Button type='submit' disabled={!credentialsForm.formState.isValid} className='p-6 w-full rounded-3xl mt-3'>{
                  isChecking ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Checking...
                  </> : 'Continue'
                }</Button>
              </form>
            </Form>
          ) : step === 2 ? (
            <Form {...genderForm}>
              <form onSubmit={genderForm.handleSubmit(onGenderSubmit)} className="space-y-3">
                <GenderStep form={genderForm} />
                <Button type='submit' disabled={!genderForm.formState.isValid} className='p-6 w-full rounded-3xl mt-3'>{
                  isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Account...
                  </> : 'Create Account'
                }</Button>
              </form>
            </Form>
          ) : (
            <SuccessStep formData={form.getValues()} />
          )
        }
        <div className="flex justify-center space-x-2 mt-3">
          {steps.slice(0, steps.length - 1).map((_, index) => (
            <div
              key={index}
              className={`h-2 w-2 rounded-full transition-all duration-300 ${index === step
                ? "bg-primary w-4"
                : index < step
                  ? "bg-primary"
                  : "bg-muted"
                }`}
              aria-label={`Step ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
