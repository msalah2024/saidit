import { z } from "zod"

export const LoginSchema = z.object({
    username: z.string().min(3, {
        message: "Please enter a valid username or email address."
    }).max(50),
    password: z.string().min(8, {
        message: "Please enter a valid password."
    })
})

export const RegisterSchema = z.object({
    email: z.string().email({
        message: "Please enter a valid email address."
    }),
    username: z.string().min(3, {
        message: "username must be at least 3 characters long."
    }).max(20),
    password: z
        .string()
        .min(8, { message: "Password must be at least 8 characters long." })
        .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter." })
        .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter." })
        .regex(/[0-9]/, { message: "Password must contain at least one number." })
        .regex(/[^a-zA-Z0-9]/, { message: "Password must contain at least one special character." }),

    gender: z.enum(["male", "female"]),
})

export const EmailStepSchema = z.object({
    email: z.string().email({
        message: "Please enter a valid email address."
    }),
})

export const CredentialsStepSchema = z.object({
    username: z.string().min(3, {
        message: "username must be at least 3 characters long."
    }).max(20),
    password: z
        .string()
        .min(8, { message: "Password must be at least 8 characters long." })
        .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter." })
        .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter." })
        .regex(/[0-9]/, { message: "Password must contain at least one number." })
        .regex(/[^a-zA-Z0-9]/, { message: "Password must contain at least one special character." }),
})

export const GenderStepSchema = z.object({
    gender: z.enum(["male", "female"])
})