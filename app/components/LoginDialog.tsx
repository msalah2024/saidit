"use client"
import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { LoginSchema, RegisterSchema } from "@/schema/index"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import type { z } from "zod"
import { ArrowLeft } from "lucide-react"
import { Form, FormControl, FormDescription, FormField, FormItem, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import googleLogo from "@/app/images/googleIcon.svg"
import discordLogo from "@/app/images/discordIcon.svg"

const steps = [
    { id: "email", name: "Email" },
    { id: "account", name: "Account Details" },
    { id: "gender", name: "Gender" },
]

export default function LoginDialog() {
    const [open, setOpen] = useState(false)
    const [formType, setFormType] = useState<"logIn" | "signUp">("logIn")
    const [currentStep, setCurrentStep] = useState(0)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const loginForm = useForm({
        resolver: zodResolver(LoginSchema),
        defaultValues: { username: "", password: "" },
        mode: "onChange",
    })

    const signupForm = useForm<z.infer<typeof RegisterSchema>>({
        resolver: zodResolver(RegisterSchema),
        defaultValues: {
            email: "",
            username: "",
            password: "",
            gender: undefined,
        },
        mode: "onChange",
    })

    const {
        formState: { isValid: isLoginValid },
    } = loginForm
    const {
        formState: { errors },
        trigger,
        watch,
    } = signupForm

    // Check if current step is valid
    const isCurrentStepValid = () => {
        switch (currentStep) {
            case 0:
                return watch("email") && !errors.email
            case 1:
                return watch("username") && watch("password") && !errors.username && !errors.password
            case 2:
                return watch("gender") && !errors.gender
            default:
                return false
        }
    }

    const onLoginSubmit = async (data: z.infer<typeof LoginSchema>) => {
        setIsSubmitting(true)
        try {
            console.log("Login data:", data)
            await new Promise((resolve) => setTimeout(resolve, 1000))
            console.log("Login successful")
            handleClose()
        } catch (error) {
            console.error("Login error:", error)
        } finally {
            setIsSubmitting(false)
        }
    }

    const onSignupSubmit = async (data: z.infer<typeof RegisterSchema>) => {
        setIsSubmitting(true)
        try {
            console.log("Signup data:", data)
            await new Promise((resolve) => setTimeout(resolve, 1000))
            console.log("Account created successfully")
            handleClose()
        } catch (error) {
            console.error("Signup error:", error)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleClose = () => {
        setOpen(false)
        setTimeout(() => {
            setFormType("logIn")
            setCurrentStep(0)
            loginForm.reset()
            signupForm.reset()
        }, 300)
    }

    const nextStep = async () => {
        const fieldsToValidate = currentStep === 0 ? ["email"] : currentStep === 1 ? ["username", "password"] : ["gender"]

        const isValid = await trigger(fieldsToValidate as any)

        if (isValid && currentStep < steps.length - 1) {
            setCurrentStep((prev) => prev + 1)
        }
    }

    return (
        <Dialog open={open} onOpenChange={(newOpen) => (newOpen ? setOpen(true) : handleClose())}>
            <DialogTrigger asChild>
                <Button onClick={() => setOpen(true)}>Log In</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>
                        <div className="text-center">
                            <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
                                {formType === "logIn" ? "Log In" : steps[currentStep].name}
                            </h3>
                        </div>
                    </DialogTitle>
                    <DialogDescription className="text-center mb-2">
                        {formType === "logIn"
                            ? "By continuing, you acknowledge that you understand and accept Saidit's terms and policies."
                            : `Step ${currentStep + 1} of ${steps.length}`}
                        <br />
                        {formType === "signUp" && currentStep === 1 && "Saidit is anonymous, so your username is what you’ll go by here. Choose wisely—because once you get a name, you can’t change it."}
                    </DialogDescription>

                    {(formType === "logIn" || (formType === "signUp" && currentStep === 0)) && (
                        <>
                            <Button className="w-full p-6 rounded-4xl text-black bg-white hover:bg-white">
                                <Image
                                    src={googleLogo || "/placeholder.svg"}
                                    alt="Google Logo"
                                    width={20}
                                    height={20}
                                    className="select-none"
                                />
                                Continue with Google
                            </Button>
                            <Button className="w-full p-6 rounded-4xl text-black bg-white hover:bg-white">
                                <Image
                                    src={discordLogo || "/placeholder.svg"}
                                    alt="Discord Logo"
                                    width={22}
                                    height={22}
                                    className="select-none"
                                />
                                Continue with Discord
                            </Button>

                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t"></span>
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-background px-2 text-muted-foreground">Or</span>
                                </div>
                            </div>
                        </>
                    )}
                </DialogHeader>

                {formType === "signUp" && currentStep > 0 && (
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setCurrentStep((prev) => prev - 1)}
                        className="absolute top-4 left-4 p-2 h-8 w-8"
                        aria-label="Go back"
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                )}

                <div className="grid gap-4">
                    {formType === "logIn" && (
                        <Form {...loginForm}>
                            <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                                <FormField
                                    control={loginForm.control}
                                    name="username"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <Input placeholder="Email or username" {...field} className="p-6 rounded-2xl" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={loginForm.control}
                                    name="password"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <Input placeholder="Password" type="password" {...field} className="p-6 rounded-2xl" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <div className="flex flex-col gap-2 ml-2">
                                    <Link href="/home">
                                        <small className="text-sm leading-none text-secondary">Forgot password?</small>
                                    </Link>
                                    <div>
                                        <small className="text-sm leading-none">New to Saidit?</small>
                                        <a
                                            href="#"
                                            onClick={(e) => {
                                                e.preventDefault()
                                                setFormType("signUp")
                                            }}
                                        >
                                            <small className="text-sm leading-none text-secondary"> Sign Up</small>
                                        </a>
                                    </div>
                                </div>
                                <Button type="submit" disabled={!isLoginValid || isSubmitting} className="w-full p-6 rounded-4xl">
                                    {isSubmitting ? "Logging In" : "Log In"}
                                </Button>
                            </form>
                        </Form>
                    )}

                    {formType === "signUp" && (
                        <Form {...signupForm}>
                            <form onSubmit={signupForm.handleSubmit(onSignupSubmit)} className="space-y-4">
                                {currentStep === 0 && (
                                    <FormField
                                        control={signupForm.control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormControl>
                                                    <Input type="email" placeholder="Email" {...field} className="p-6 rounded-2xl" />
                                                </FormControl>
                                                <FormDescription className="ml-1">We&apos;ll use this email for account verification.</FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                )}

                                {currentStep === 1 && (
                                    <>
                                        <FormField
                                            control={signupForm.control}
                                            name="username"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormControl>
                                                        <Input placeholder="Username" {...field} className="p-6 rounded-2xl" />
                                                    </FormControl>
                                                    <FormDescription className="ml-1">This is your public display name.</FormDescription>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={signupForm.control}
                                            name="password"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormControl>
                                                        <Input type="password" placeholder="Password" {...field} className="p-6 rounded-2xl" />
                                                    </FormControl>
                                                    <FormDescription className="ml-1">
                                                        Password must be at least 8 characters with lowercase, uppercase, number, and special
                                                        character.
                                                    </FormDescription>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </>
                                )}

                                {currentStep === 2 && (
                                    <FormField
                                        control={signupForm.control}
                                        name="gender"
                                        render={({ field }) => (
                                            <FormItem>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger className="p-6 rounded-2xl w-full">
                                                            <SelectValue placeholder="Select your gender" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="male">Male</SelectItem>
                                                        <SelectItem value="female">Female</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormDescription className="ml-1">This information helps us personalize your experience.</FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                )}

                                <Button
                                    type={currentStep === steps.length - 1 ? "submit" : "button"}
                                    onClick={currentStep < steps.length - 1 ? nextStep : undefined}
                                    disabled={!isCurrentStepValid() || isSubmitting}
                                    className="w-full p-6 rounded-4xl"
                                >
                                    {currentStep < steps.length - 1
                                        ? "Continue"
                                        : isSubmitting
                                            ? "Creating Account..."
                                            : "Create Account"}
                                </Button>

                                <div className="flex justify-center space-x-2 mt-4">
                                    {steps.map((_, index) => (
                                        <div
                                            key={index}
                                            className={`h-2 w-2 rounded-full transition-all duration-300 ${index === currentStep
                                                ? "bg-primary w-4"
                                                : index < currentStep
                                                    ? "bg-primary"
                                                    : "bg-muted"
                                                }`}
                                            aria-label={`Step ${index + 1}`}
                                        />
                                    ))}
                                </div>

                                {currentStep === 0 && (
                                    <div className="flex justify-center items-center gap-2 mt-2">
                                        <small className="text-sm leading-none">Already have an account?</small>
                                        <a
                                            href="#"
                                            onClick={(e) => {
                                                e.preventDefault()
                                                setFormType("logIn")
                                            }}
                                        >
                                            <small className="text-sm leading-none text-secondary"> Log In</small>
                                        </a>
                                    </div>
                                )}
                            </form>
                        </Form>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}


