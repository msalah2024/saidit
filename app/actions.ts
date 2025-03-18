"use server";

// import { encodedRedirect } from "@/utils/utils";
import { createClient } from "@/utils/supabase/server";
import { z } from "zod";
// import { headers } from "next/headers";
// import { redirect } from "next/navigation";
import { EmailStepSchema, CredentialsStepSchema, LoginSchema, RegisterSchema } from "@/schema";
import { revalidatePath } from "next/cache";

export async function isEmailAvailable(formData: z.infer<typeof EmailStepSchema>) {
  const email = formData.email
  const supabase = await createClient()

  try {
    const { error: emailError } = await supabase.from("users").select("email").eq("email", email).single()

    if (emailError && emailError.code === 'PGRST116') {
      return {
        success: true,
        message: "Email is available"
      }
    }

    else {
      return {
        success: false,
        message: "Email is already taken"
      }
    }

  } catch (error) {
    console.error("Email Error", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "An error occurred"
    }
  }
}

export async function isUserNameAvailable(formData: z.infer<typeof CredentialsStepSchema>) {
  const username = formData.username
  const supabase = await createClient()

  try {
    const { error: usernameError } = await supabase.from("users").select("username").eq("username", username).single()

    if (usernameError && usernameError.code === 'PGRST116') {
      return {
        success: true,
        message: "Username is available"
      }
    }

    else {
      return {
        success: false,
        message: "Username is already taken"
      }
    }

  } catch (error) {
    console.error("Username Error", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "An error occurred"
    }
  }
}

export async function signUp(formData: z.infer<typeof RegisterSchema>) {
  const supabase = await createClient()
  const username = formData.username
  const email = formData.email
  const gender = formData.gender
  const password = formData.password

  try {
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (authError) {
      console.error("Auth Error", authError.message)
      throw new Error(authError.message || "An error occurred")
    }

    const { error: profileError } = await supabase.from("users").insert({
      username,
      email,
      gender
    })

    if (profileError) {
      console.error("Profile Error", profileError.message)
      throw new Error(profileError.message || "An error occurred")
    }

    return {
      success: true,
      message: "Account created successfully",
      data: authData
    }

  } catch (error) {
    console.error("Sign Up Error", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "An error occurred"
    }
  }
}
