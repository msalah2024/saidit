import { z } from "zod"


export const LoginSchema = z.object({
    username: z.string().min(3, {
        message: "Please enter a valid username or email address."
    }).max(20),
    password: z.string().min(6, {
        message: "Please enter a valid password."
    }).max(100)
})
