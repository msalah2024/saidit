import { z } from "zod"

const emailSchema = z.string().email({
    message: "Please enter a valid email address."
})

const userNameSchema = z.string().min(3, {
    message: "Username must be at least 3 characters long."
}).max(20, {
    message: "Username must be at most 20 characters long."
}).regex(
    /^[a-zA-Z0-9-_]+$/,
    'Username can only contain letters, numbers, hyphens (-), and underscores (_).'
).refine((val) => !/\s/.test(val), {
    message: 'Username cannot contain spaces.',
})

const unifiedLoginSchema = z.union([emailSchema, userNameSchema])

export const LoginSchema = z.object({
    identifier: unifiedLoginSchema,
    password: z.string().min(8, {
        message: "Please enter a valid password."
    })
})

export const RegisterSchema = z.object({
    email: z.string().email({
        message: "Please enter a valid email address."
    }),
    username: z.string().min(3, {
        message: "Username must be at least 3 characters long."
    }).max(20, {
        message: "Username must be at most 20 characters long."
    }).regex(
        /^[a-zA-Z0-9-_]+$/,
        'Username can only contain letters, numbers, hyphens (-), and underscores (_).'
    ).refine((val) => !/\s/.test(val), {
        message: 'Username cannot contain spaces.',
    }),
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
        message: "Username must be at least 3 characters long."
    }).max(20, {
        message: "Username must be at most 20 characters long."
    }).regex(
        /^[a-zA-Z0-9-_]+$/,
        'Username can only contain letters, numbers, hyphens (-), and underscores (_).'
    ).refine((val) => !/\s/.test(val), {
        message: 'Username cannot contain spaces.',
    }),
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