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

const unifiedLoginSchema = z.union([userNameSchema, emailSchema])

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

export const ResetPasswordIdentifierSchema = z.object({
    identifier: unifiedLoginSchema
})

export const ResetPasswordSchema = z.object({
    password: z
        .string()
        .min(8, { message: "Password must be at least 8 characters long." })
        .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter." })
        .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter." })
        .regex(/[0-9]/, { message: "Password must contain at least one number." })
        .regex(/[^a-zA-Z0-9]/, { message: "Password must contain at least one special character." }),
    confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});

export const CreateProfileUserNameSchema = z.object({
    username: userNameSchema,
})

export const CreateProfileGenderSchema = z.object({
    gender: z.enum(["male", "female"]),
})

export const CreateProfileSchema = z.object({}).merge(CreateProfileUserNameSchema).merge(CreateProfileGenderSchema)

export const PasswordSchema = z.object({
    password: z.string().min(8, {
        message: "Please enter a valid password."
    })
})

export const UpdateEmailSchema = z.object({}).merge(PasswordSchema).merge(EmailStepSchema)

export const UpdatePasswordSchema = z.object({
    currentPassword: z.string().min(8, {
        message: "Current password must be at least 8 characters."
    }),
    password: z.string()
        .min(8, {
            message: "Password must be at least 8 characters."
        })
        .regex(/[a-z]/)
        .regex(/[A-Z]/)
        .regex(/[0-9]/)
        .regex(/[^a-zA-Z0-9]/),
    confirmPassword: z.string().min(8, {
        message: "Password must be at least 8 characters."
    })
})
    .refine(data => data.password === data.confirmPassword, {
        message: "New passwords don't match",
        path: ["confirmPassword"]
    })
    .refine(data => data.currentPassword !== data.password, {
        message: "New password must differ from current password",
        path: ["password"]
    })
    .refine(data => data.currentPassword !== data.confirmPassword, {
        message: "Confirmation must differ from current password",
        path: ["confirmPassword"]
    });

export const DisplayNameSchema = z.object({
    displayName: z.string().max(90, {
        message: "Display name must not be longer than 90 characters."
    })
})

export const DescriptionSchema = z.object({
    description: z.string().max(200, {
        message: "Description must not be longer than 200 characters."
    })
})

export const SocialLinkSchema = z.object({
    text: z.string().min(1, {
        message: "Your value must be at least 1 character long"
    })
})

export const CreateCommunitySchema = z.object({
    name: z.string().min(3, { message: "Community name must be at least 3 characters" })
        .max(21, { message: "Community name must be less than 21 characters" })
        .regex(/^[a-zA-Z0-9_]+$/, { message: "Only letters, numbers, and underscores are allowed" }),
    description: z.string().min(1, { message: "You must add a description" })
        .max(500, { message: "Description must be less than 500 characters" }),
    type: z.enum(["public", "restricted", "private"], {
        required_error: "You need to select a community type",
    }),
    topics: z.array(z.string()).min(1, { message: "Add at least one topic" })
})

export const ManageDetailsWidgetSchema = z.object({
    displayName: z.string().max(100, { message: "Display name must be less than 100 characters" }),
    membersNickname: z.string().max(30, { message: "Members nickname must be less than 30 characters" }),
    currentlyViewingNickname: z.string().max(30, { message: "Currently viewing nickname must be less than 30 characters" }),
    description: z.string().max(500, { message: "Description must be less than 500 characters" })
})

export const TextPostSchema = z.object({
    title: z.string().min(3, { message: "The title must be at least 3 characters long" })
        .max(300, { message: "Title must be less than 300 characters" }),
    body: z.string().optional()
})

export const ImagePostSchema = z.object({
    title: z.string().min(3, { message: "The title must be at least 3 characters long" })
        .max(300, { message: "Title must be less than 300 characters" }),
    body: z.string().optional(),
    images: z.array(
        z.object({
            image: z.instanceof(File),
            width: z.number().positive(),
            height: z.number().positive(),
            alt: z.string(),
            caption: z.string().max(180).optional()
        })
    ).min(1, { message: "At least one image is required" })
        .max(20, { message: "Maximum of 20 images allowed" })
})