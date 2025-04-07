"use server";

// import { encodedRedirect } from "@/utils/utils";
import { createClient } from "@/utils/supabase/server";
import { z } from "zod";
// import { headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  EmailStepSchema, CredentialsStepSchema, LoginSchema, RegisterSchema,
  ResetPasswordIdentifierSchema, ResetPasswordSchema, CreateProfileUserNameSchema,
  CreateProfileSchema
} from "@/schema";
import { User } from "@supabase/supabase-js";

export async function isEmailAvailable(formData: z.infer<typeof EmailStepSchema>) {
  const email = formData.email.toLowerCase()
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

export async function isUserNameAvailable(formData: z.infer<typeof CredentialsStepSchema> | z.infer<typeof CreateProfileUserNameSchema>) {
  const username = formData.username.toLowerCase()
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
  const email = formData.email.toLowerCase()
  const gender = formData.gender
  const password = formData.password

  try {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    })

    if (authError) {
      console.error("Auth Error", authError.message)
      throw new Error(authError.message || "An error occurred")
    }

    const avatar_url = gender === "male" ? (await supabase.storage.from("saidit-defaults").getPublicUrl("default-avatars/saidit-male-avatar-new.png")) : (await supabase.storage.from("saidit-defaults").getPublicUrl("default-avatars/saidit-female-avatar-new.png"))

    const { error: profileError } = await supabase.from("users").insert({
      username,
      email,
      gender,
      account_id: authData?.user?.id,
      avatar_url: avatar_url.data.publicUrl
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

export async function logIn(formData: z.infer<typeof LoginSchema>) {
  const supabase = await createClient()
  const { identifier, password } = formData

  const isEmail = z.string().email().safeParse(identifier).success

  try {

    if (isEmail) {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: identifier,
        password
      })

      if (authError) {
        console.error("Auth Error", authError.message)
        throw new Error(authError.message || "An error occurred")
      }

      return {
        success: true,
        message: "Logged in successfully",
        data: authData
      }

    }
    else {
      const { data: userEmail, error: emailError } = await supabase.from("users").select("email").eq("username", identifier).single()

      if (emailError) {
        console.error("Email Error", emailError.message)
        throw new Error(emailError.message || "An error occurred")
      }

      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: userEmail?.email,
        password
      })

      if (authError) {
        console.error("Auth Error", authError.message)
        throw new Error(authError.message || "An error occurred")
      }

      return {
        success: true,
        message: "Logged in successfully",
        data: authData
      }
    }

  } catch (error) {
    console.error("Log In Error", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "An error occurred"
    }
  }
}

export async function SignOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return redirect("/")
};

export async function resetPassword(formData: z.infer<typeof ResetPasswordIdentifierSchema>) {
  const supabase = await createClient()
  const identifier = formData.identifier

  try {
    if (z.string().email().safeParse(identifier).success) {
      const { error } = await supabase.auth.resetPasswordForEmail(identifier)
      if (error) {
        console.error("Reset Password Error", error)
        throw new Error(error.message || "An error occurred")
      }
      return {
        success: true,
        message: "Password reset email sent successfully",
      }
    }
    else {
      const { data: userEmail, error: userEmailError } = await supabase.from("users").select("email").eq("username", identifier).single()

      if (userEmailError) {
        console.error("User Email Error", userEmailError.message)
        throw new Error(userEmailError.message || "An error occurred")
      }

      const { error } = await supabase.auth.resetPasswordForEmail(userEmail?.email)

      if (error) {
        console.error("Reset Password Error", error)
        throw new Error(error.message || "An error occurred")
      }

      return {
        success: true,
        message: "Password reset email sent successfully",
      }
    }

  } catch (error) {
    console.error("Reset Password Error", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "An error occurred"
    }
  }
}

export async function updatePassword(formData: z.infer<typeof ResetPasswordSchema>) {
  const supabase = await createClient()
  const password = formData.password

  try {
    await supabase.auth.updateUser({ password: password })

    return {
      success: true,
      message: "Password updated successfully",
    }

  } catch (error) {
    console.error("Update Password Error", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "An error occurred"
    }
  }
}

export async function signInWithDiscord() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'discord',
    options: {
      redirectTo: 'http://localhost:3000/auth/callback',
    },
  })

  if (error) {
    console.error("Discord Sign In Error", error)
    throw new Error(error.message || "An error occurred")
  }

  if (data.url) {
    redirect(data.url)
  }
}

export async function createProfile(formData: z.infer<typeof CreateProfileSchema>, user: User) {
  const supabase = await createClient()
  const username = formData.username
  const gender = formData.gender
  const email = user.email?.toLowerCase()
  const account_id = user.id

  try {
    const avatar_url = gender === "male" ? (await supabase.storage.from("saidit-defaults").getPublicUrl("default-avatars/saidit-male-avatar-new.png")) : (await supabase.storage.from("saidit-defaults").getPublicUrl("default-avatars/saidit-female-avatar-new.png"))

    const { error: profileError } = await supabase.from("users").insert({
      username,
      email,
      gender,
      account_id: account_id,
      avatar_url: avatar_url.data.publicUrl
    })

    if (profileError) {
      console.error("Profile Error", profileError.message)
      throw new Error(profileError.message || "An error occurred")
    }

    return {
      success: true,
      message: "Profile created successfully",
    }

  } catch (error) {
    console.error("Profile Creation Error", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "An error occurred"
    }
  }

}