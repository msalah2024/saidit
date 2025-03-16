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

  function onEmailSubmit(values: z.infer<typeof EmailStepSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    try {

      setIsChecking(true)
      console.log(values)
      setIsChecking(false)
      form.setValue('email', values.email)
      setStep((prev) => prev + 1)

    } catch (error) {
      console.error(error)
    } finally {

    }
  }

  function onCredentialsSubmit(values: z.infer<typeof CredentialsStepSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    try {

      setIsChecking(true)
      console.log(values)
      setIsChecking(false)
      form.setValue('username', values.username)
      form.setValue('password', values.password)
      setStep((prev) => prev + 1)

    } catch (error) {
      console.error(error)
    } finally {

    }
  }

  function onGenderSubmit(values: z.infer<typeof GenderStepSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    try {

      form.setValue('gender', values.gender)
      onSubmit(form.getValues())

    }
    catch (error) {
      console.error(error)
    }
    finally {
    }
  }

  function onSubmit(values: z.infer<typeof RegisterSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.

    try {

      setIsSubmitting(true)
      console.log(values)
      setIsSubmitting(false)
      setStep((prev) => prev + 1)

    } catch (error) {
      console.error(error)
    } finally {

    }
  }

  return (
    <div>
      <DialogHeader>
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
                <Button type='submit' disabled={!emailForm.formState.isValid} className='p-6 w-full rounded-3xl'>
                  {isChecking ? 'Checking...' : 'Continue'}
                </Button>
              </form>
            </Form>
          ) : step === 1 ? (
            <Form {...credentialsForm}>
              <form onSubmit={credentialsForm.handleSubmit(onCredentialsSubmit)} className="space-y-3">
                <CredentialsStep form={credentialsForm} />
                <Button type='submit' disabled={!credentialsForm.formState.isValid} className='p-6 w-full rounded-3xl'>{
                  isChecking ? 'Checking...' : 'Continue'
                }</Button>
              </form>
            </Form>
          ) : step === 2 ? (
            <Form {...genderForm}>
              <form onSubmit={genderForm.handleSubmit(onGenderSubmit)} className="space-y-3">
                <GenderStep form={genderForm} />
                <Button type='submit' disabled={!genderForm.formState.isValid} className='p-6 w-full rounded-3xl'>{
                  isSubmitting ? 'Creating Account...' : 'Create Account'
                }</Button>
              </form>
            </Form>
          ) : (
            <SuccessStep formData={form.getValues()} />
          )
        }
        {/* <Form {...form}>
          <form onSubmit={
            step === 0 ? emailForm.handleSubmit(onEmailSubmit) :
              step === 1 ? credentialsForm.handleSubmit(onCredentialsSubmit) :
                genderForm.handleSubmit(onGenderSubmit)
          } className="space-y-3">
            <>{renderStep()}</>
            {
              step === 0 && (
                <div className='ml-2 mb-6'>
                  <div className='space-x-1'>
                    <small className="text-sm font-medium leading-none">Already a Saiditor?</small>
                    <Link href="#" className='text-sm text-secondary' onClick={onSwitchToLogIn}>Log In</Link>
                  </div>
                </div>
              )
            }
            {
              step === 0 ? (
                <Button type='submit' disabled={!emailForm.formState.isValid} className='p-6 w-full rounded-3xl'>
                  {isChecking ? 'Checking...' : 'Continue'}
                </Button>
              ) : step === 1 ? (
                <Button type='submit' disabled={!credentialsForm.formState.isValid} className='p-6 w-full rounded-3xl'>{
                  isChecking ? 'Checking...' : 'Continue'
                }</Button>
              ) : step === 2 ? (
                <Button type='submit' disabled={!genderForm.formState.isValid} className='p-6 w-full rounded-3xl'>{
                  isSubmitting ? 'Creating Account...' : 'Create Account'
                }</Button>
              ) : (
                null
              )
            }
          </form>
        </Form> */}
      </div>
    </div>
  )
}
