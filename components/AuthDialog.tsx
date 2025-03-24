"use client"
import React, { useEffect, useState } from 'react'
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogTrigger,
} from "@/components/ui/dialog"
import LogInForm from './log-in-form'
import SignUpForm from './sign-up-form'

export default function AuthDialog() {
    const [authMode, setAuthMode] = useState<"logIn" | "signUp">("logIn")
    const [open, setOpen] = useState(false)



    useEffect(() => {
        if (!open) {
            setTimeout(() => {
                setAuthMode("logIn")
            }, 300)
        }
    }, [open])

    return (
        <Dialog onOpenChange={setOpen} open={open}>
            <DialogTrigger asChild className='mr-4'>
                <Button className='rounded-xl'>Log In</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                {
                    authMode === "logIn" ? (
                        <LogInForm onSwitchToSignUp={() => setAuthMode("signUp")} setOpen={setOpen} />
                    ) : (
                        <SignUpForm onSwitchToLogIn={() => setAuthMode("logIn")} />
                    )
                }
            </DialogContent>
        </Dialog>

    )
}
