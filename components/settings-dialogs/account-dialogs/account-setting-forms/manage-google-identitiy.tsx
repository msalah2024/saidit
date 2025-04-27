import React, { useState } from 'react'
import { PasswordSchema } from '@/schema'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { DialogClose } from '@/components/ui/dialog'
import { Loader2 } from 'lucide-react'
import { DrawerClose } from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'
import { User } from '@supabase/supabase-js'
import Image from 'next/image'
import googleLogo from "@/public/assets/images/googleIcon.svg"
import { manageGoogleIdentity } from '@/app/actions'

interface ManageDiscordIdentityProps {
  googleIdentity: boolean | undefined
  isDesktop: boolean
  user: User | null
  onOpenChange: (open: boolean) => void
}

export default function ManageDiscordIdentity({ googleIdentity, isDesktop, user, onOpenChange }: ManageDiscordIdentityProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const googleIdentityInfo = user?.identities?.find((identity) => identity.provider === "google")?.identity_data

  const form = useForm<z.infer<typeof PasswordSchema>>({
    resolver: zodResolver(PasswordSchema),
    defaultValues: {
      password: "",
    },
  })

  async function onSubmit(values: z.infer<typeof PasswordSchema>) {
    try {
      setIsSubmitting(true)
      if (!user) { return }

      const result = await manageGoogleIdentity(values, googleIdentity, user.email)

      if (result?.success) {
        onOpenChange(false)
        if (result.url) {
          window.location.href = result.url
        }
      }

      else {
        form.setError("password", {
          type: "custom",
          message: result?.message || "An error occurred while processing your request.",
        })
      }

    } catch (error) {
      console.error("Error submitting form:", error)
      form.setError("password", {
        type: "custom",
        message: "An error occurred while processing your request.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (googleIdentity) {
    return (
      <div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input placeholder="Current password" type='password' className='p-6' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className='bg-white rounded-full flex justify-between items-center py-2 px-3 mt-4 gap-2'>
              <Image src={googleIdentityInfo?.avatar_url}
                width={24} height={24} alt='google logo' draggable={false} className='rounded-full' />
              <div className='flex justify-between w-full'>
                <div className='flex flex-col gap-1'>
                  <small className="text-xs text-muted font-medium leading-none">{
                    googleIdentityInfo?.full_name
                  }</small>
                  <small className="text-xs text-muted-foreground font-medium leading-none">{
                    googleIdentityInfo?.email
                  }</small>
                </div>
                <Image src={googleLogo} width={20} height={20} draggable={false} alt='google logo' />
              </div>
            </div>
            {
              isDesktop ?
                (<div className='flex gap-2 justify-end mt-8'>
                  <DialogClose asChild>
                    <Button type="button" variant="redditGray">
                      Cancel
                    </Button>
                  </DialogClose>
                  <Button type="submit" disabled={!form.formState.isValid || isSubmitting} className='rounded-full px-6'>{isSubmitting ? <>
                    <Loader2 className="mr-1 h-4 w-4 animate-spin" />Saving...
                  </> : 'Save'}</Button>
                </div>) :
                (
                  <div className='flex flex-col gap-2 justify-end my-4'>
                    <Button type="submit" disabled={!form.formState.isValid || isSubmitting} className='rounded-full'>{isSubmitting ? <>
                      <Loader2 className="mr-1 h-4 w-4 animate-spin" />Saving...
                    </> : 'Save'}</Button>
                    <DrawerClose asChild>
                      <Button type="button" variant="redditGray">
                        Cancel
                      </Button>
                    </DrawerClose>
                  </div>
                )
            }
          </form>
        </Form>
      </div>
    )
  }

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input placeholder="Current password" type='password' className='p-6' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {
            isDesktop ?
              (<div className='flex gap-2 justify-end mt-8'>
                <DialogClose asChild>
                  <Button type="button" variant="redditGray">
                    Cancel
                  </Button>
                </DialogClose>
                <Button type="submit" disabled={!form.formState.isValid || isSubmitting} className='rounded-full px-6'>{isSubmitting ? <>
                  <Loader2 className="mr-1 h-4 w-4 animate-spin" />Saving...
                </> : 'Save'}</Button>
              </div>) :
              (
                <div className='flex flex-col gap-2 justify-end my-4'>
                  <Button type="submit" disabled={!form.formState.isValid || isSubmitting} className='rounded-full'>{isSubmitting ? <>
                    <Loader2 className="mr-1 h-4 w-4 animate-spin" />Saving...
                  </> : 'Save'}</Button>
                  <DrawerClose asChild>
                    <Button type="button" variant="redditGray">
                      Cancel
                    </Button>
                  </DrawerClose>
                </div>
              )
          }
        </form>
      </Form>
    </div>
  )
}
