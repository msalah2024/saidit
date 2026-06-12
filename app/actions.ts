"use server";

// import { encodedRedirect } from "@/utils/utils";
import { createClient } from "@/utils/supabase/server";
import { z } from "zod";
// import { headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  EmailStepSchema, CredentialsStepSchema, LoginSchema, RegisterSchema,
  ResetPasswordIdentifierSchema, ResetPasswordSchema, CreateProfileUserNameSchema,
  CreateProfileSchema,
  GenderStepSchema,
  PasswordSchema,
  UpdateEmailSchema,
  UpdatePasswordSchema,
  DisplayNameSchema,
  DescriptionSchema,
  CreateCommunitySchema,
  ManageDetailsWidgetSchema,
  TextPostSchema,
  LinkPostSchema
} from "@/schema";
import { User } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { Tables } from "@/database.types";
import { nanoid } from 'nanoid'
import { CommentWithAuthor } from "@/complexTypes";
import { getSupabaseAdmin } from "@/utils/supabase/admin";


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
    const { error: usernameError } = await supabase.from("users").select("username").eq("username_lower", username).single()

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
  const username_lower = formData.username.toLowerCase()
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
      username_lower,
      email,
      gender,
      account_id: authData?.user?.id,
      avatar_url: avatar_url.data.publicUrl
    })

    if (profileError) {
      if (profileError?.code === '23503') {
        console.error("An account with a similar email already exists. Please use a different email or try logging in.")
        return {
          success: false,
          message: "An account with a similar email already exists. Please use a different email or try logging in."
        }
      }
      else {
        console.error("Profile Error", profileError.message)
        throw new Error(profileError.message || "An error occurred")
      }
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
      const { data: userEmail, error: emailError } = await supabase.from("users").select("email").eq("username_lower", identifier.toLowerCase()).single()

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
      const { data: userEmail, error: userEmailError } = await supabase.from("users").select("email").eq("username_lower", identifier.toLowerCase()).single()

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

    const { error } = await supabase.auth.updateUser({
      data: { hasPassword: true }
    })

    if (error) {
      console.error("Error updating metadata", error.message)
      throw new Error(error.message || "An error occurred")
    }

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
      redirectTo: `${process.env.NEXT_PUBLIC_DOMAIN}/auth/callback`,
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

export async function signInWithGoogle() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_DOMAIN}/auth/callback`,
    },
  })

  if (error) {
    console.error("Google Sign In Error", error)
    throw new Error(error.message || "An error occurred")
  }

  if (data.url) {
    redirect(data.url)
  }
}

export async function createProfile(formData: z.infer<typeof CreateProfileSchema>, user: User) {
  const supabase = await createClient()
  const username = formData.username
  const username_lower = formData.username.toLowerCase()
  const gender = formData.gender
  const email = user.email?.toLowerCase()
  const account_id = user.id

  try {
    const avatar_url = gender === "male" ? (await supabase.storage.from("saidit-defaults").getPublicUrl("default-avatars/saidit-male-avatar-new.png")) : (await supabase.storage.from("saidit-defaults").getPublicUrl("default-avatars/saidit-female-avatar-new.png"))

    const { error: profileError } = await supabase.from("users").insert({
      username,
      username_lower,
      email,
      gender,
      account_id: account_id,
      avatar_url: avatar_url.data.publicUrl
    })

    if (profileError) {
      console.error("Profile Error", profileError.message)
      throw new Error(profileError.message || "An error occurred")
    }

    revalidatePath("/")

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

export async function fetchProfile(username: string) {
  const supabase = await createClient()

  try {
    const { data: profile, error } = await supabase.from("users").select("*").eq("username_lower", username.toLowerCase()).single()

    if (error && error.code === 'PGRST116') {
      return {
        success: false,
        message: "Profile not found"
      }
    }

    if (error) {
      console.error("Profile Fetch Error", error)
      throw new Error(error.message || "An error occurred")
    }

    else {
      return {
        success: true,
        message: "Profile fetched successfully",
        data: profile
      }
    }

  } catch (error) {
    console.error("Profile Fetch Error", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "An error occurred"
    }
  }

}

export async function updateEmail(formData: z.infer<typeof UpdateEmailSchema>, user: User) {
  const supabase = await createClient()
  const email = formData.email.toLowerCase()
  const account_id = user.id

  try {

    if (!user.email) {
      return {
        success: false,
        message: "An Error occurred"
      }
    }

    const { error: userAuthError } = await supabase.auth.signInWithPassword({
      email: user?.email,
      password: formData.password
    })

    if (userAuthError) {
      console.error("User Auth Error", userAuthError.message)
      if (userAuthError.message === "Invalid login credentials") {
        throw new Error("Invalid password")
      }
      else {
        throw new Error(userAuthError.message || "An error occurred")
      }
    }

    else {
      const { error } = await supabase.auth.updateUser({ email: email })

      if (error) {
        console.error("Email Update Error", error.message)
        throw new Error(error.message || "An error occurred")
      }

      const { error: emailError } = await supabase.from("users").update({ email }).eq("account_id", account_id)

      if (emailError) {
        console.error("Email Update Error", emailError.message)
        throw new Error(emailError.message || "An error occurred")
      }

      return {
        success: true,
        message: "Email updated successfully",
      }
    }

  } catch (error) {
    console.error("Email Update Error", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "An error occurred"
    }
  }
}


export async function updateGender(formData: z.infer<typeof GenderStepSchema>, profile: Tables<'users'>) {
  const supabase = await createClient()
  const gender = formData.gender
  const id = profile.id

  try {
    const { error } = await supabase.from("users").update({ gender: gender }).eq("id", id)

    if (error) {
      console.error("Error updating gender", error.message)
      throw new Error(error.message || "An error occurred")
    }

    return {
      success: true,
    }

  } catch (error) {
    console.error("Error updating gender", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "An error occurred"
    }
  }
}

export async function manageDiscordIdentity(formData: z.infer<typeof PasswordSchema>, discordIdentity: boolean | undefined, userEmail: string | undefined) {
  const supabase = await createClient()
  const password = formData.password
  const email = userEmail?.toLowerCase()

  try {

    if (!email) {
      throw new Error("User email not found")
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password
    })

    if (error) {
      console.error("Use Authentication Error", error.message)
      throw new Error(error.message || "An error occurred")
    }

    else {
      if (!discordIdentity) {
        const { data, error } = await supabase.auth.linkIdentity({
          provider: 'discord',
          options: {
            redirectTo: `${process.env.NEXT_PUBLIC_DOMAIN}/protected/settings/account`,
          },
        })
        if (error) {
          console.error("Discord Identity Error", error.message)
          throw new Error(error.message || "An error occurred")
        }
        return {
          success: true,
          message: "Discord identity linked successfully",
          url: data.url,
        }
      }

      else {
        const { data: identities, error: identitiesError } = await supabase.auth.getUserIdentities()
        if (!identitiesError) {
          const discordIdentity = identities.identities.find((identity) => identity.provider === 'discord')
          if (discordIdentity) {
            const { error } = await supabase.auth.unlinkIdentity(discordIdentity)
            if (error) {
              console.error("Discord Identity Error", error.message)
              throw new Error(error.message || "An error occurred")
            }
            return {
              success: true,
              message: "Discord identity unlinked successfully",
            }
          }
        }
      }
    }

  } catch (error) {
    console.error("Discord Identity Error", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "An error occurred"
    }
  }
}

export async function manageGoogleIdentity(formData: z.infer<typeof PasswordSchema>, googleIdentity: boolean | undefined, userEmail: string | undefined) {
  const supabase = await createClient()
  const password = formData.password
  const email = userEmail?.toLowerCase()

  try {

    if (!email) {
      throw new Error("User email not found")
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password
    })

    if (error) {
      console.error("Use Authentication Error", error.message)
      throw new Error(error.message || "An error occurred")
    }

    else {
      if (!googleIdentity) {
        const { data, error } = await supabase.auth.linkIdentity({
          provider: 'google',
          options: {
            redirectTo: `${process.env.NEXT_PUBLIC_DOMAIN}/protected/settings/account`,
          },
        })
        if (error) {
          console.error("Google Identity Error", error.message)
          throw new Error(error.message || "An error occurred")
        }
        return {
          success: true,
          message: "Google identity linked successfully",
          url: data.url,
        }
      }

      else {
        const { data: identities, error: identitiesError } = await supabase.auth.getUserIdentities()
        if (!identitiesError) {
          const googleIdentity = identities.identities.find((identity) => identity.provider === 'google')
          if (googleIdentity) {
            const { error } = await supabase.auth.unlinkIdentity(googleIdentity)
            if (error) {
              console.error("Google Identity Error", error.message)
              throw new Error(error.message || "An error occurred")
            }
            return {
              success: true,
              message: "Google identity unlinked successfully",
            }
          }
        }
      }
    }
  } catch (error) {
    console.error("Google Identity Error", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "An error occurred"
    }
  }
}

export async function hasPassword() {
  const supabase = await createClient()
  try {
    const { error } = await supabase.auth.updateUser({
      data: { hasPassword: true }
    })

    if (error) {
      console.error("Error updating metadata", error.message)
      throw new Error(error.message || "An error occurred")
    }

    return {
      success: true,
      message: "Metadata updated successfully"
    }

  } catch (error) {
    console.error("Error updating metadata", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "An error occurred"
    }
  }

}


export async function updatePasswordInSettings(formData: z.infer<typeof UpdatePasswordSchema>, user: User) {
  const supabase = await createClient()
  const password = formData.password

  try {

    if (!user.email) {
      return {
        success: false,
        message: "An Error occurred"
      }
    }

    const { error: userAuthError } = await supabase.auth.signInWithPassword({
      email: user?.email,
      password: formData.currentPassword
    })

    if (userAuthError) {
      console.error("User Auth Error", userAuthError.message)
      if (userAuthError.message === "Invalid login credentials") {
        throw new Error("Invalid password")
      }
      else {
        throw new Error(userAuthError.message || "An error occurred")
      }
    }
    else {
      await supabase.auth.updateUser({ password: password })

      const { error } = await supabase.auth.updateUser({
        data: { hasPassword: true }
      })

      if (error) {
        console.error("Error updating metadata", error.message)
        throw new Error(error.message || "An error occurred")
      }

      return {
        success: true,
        message: "Password updated successfully",
      }
    }
  } catch (error) {
    console.error("Update Password Error", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "An error occurred"
    }
  }
}

export async function updateDisplayName(formData: z.infer<typeof DisplayNameSchema>, profileID: string) {
  const supabase = await createClient()
  const displayName = formData.displayName

  try {
    const { error } = await supabase.from("users").update({
      display_name: displayName
    }).eq('id', profileID)

    if (error) {
      console.error("Display name update error", error.message)
      throw new Error(error.message || "An error occurred")
    }

    else {
      return {
        success: true,
        message: "Display name updated successfully"
      }
    }

  } catch (error) {
    console.error("Display name update error", error)
    return {
      success: false,
      message: "Display name update error"
    }
  }

}

export async function updateDescription(formData: z.infer<typeof DescriptionSchema>, profileID: string) {
  const supabase = await createClient()
  const description = formData.description

  try {
    const { error } = await supabase.from('users').update({
      description: description
    }).eq('id', profileID)

    if (error) {
      console.error("Update description error", error.message)
      throw new Error(error.message || "An error occurred")
    }
    else {
      return {
        success: true,
        message: "Description updated successfully"
      }
    }

  } catch (error) {
    console.error("Update description error", error)
    return {
      success: false,
      message: "Update description error"
    }
  }

}

export async function upsertSocialLink(name: string, userID: string, url: string, username: string, account_username: string) {
  const supabase = await createClient()

  try {
    const { error } = await supabase.from("social_links").upsert({
      social_name: name,
      link: url,
      account_id: userID,
      username: username,
      account_username: account_username.toLowerCase()
    }).eq('account_id', userID)

    if (error) {
      console.error("Sync social link error", error.message)
      throw new Error(error.message || "An error occurred")
    }

    else {
      return {
        success: true,
        message: "Social link synced"
      }
    }

  } catch (error) {
    console.error("Sync social link error", error)
    return {
      success: false,
      message: "Sync social link error"
    }
  }

}

export async function getSocialLinks(userID: string) {
  const supabase = await createClient()

  try {
    const { data: socialLinks, error } = await supabase.from('social_links').select().eq('account_id', userID)

    if (error) {
      console.error("Fetch links error", error.message)
      throw new Error(error.message || "An error occurred")
    }

    else {
      return {
        success: true,
        message: "Fetch links successful",
        data: socialLinks
      }
    }

  } catch (error) {
    console.error("Fetch links error", error)
    return {
      success: false,
      message: "Fetch links error"
    }
  }
}

export async function getSocialLinksByUserName(username: string) {
  const supabase = await createClient()

  try {
    const { data: socialLinks, error } = await supabase.from('social_links').select().eq('account_username', username.toLowerCase())
    if (error) {
      console.error("Fetch links error", error.message)
      throw new Error(error.message || "An error occurred")
    }

    else {
      return {
        success: true,
        message: "Fetch links successful",
        data: socialLinks
      }
    }

  } catch (error) {
    console.error("Fetch links error", error)
    return {
      success: false,
      message: "Fetch links error"
    }
  }
}

export async function deleteSocialLink(socialID: string) {
  const supabase = await createClient()

  try {
    const { error } = await supabase.from('social_links').delete().eq('id', socialID)
    if (error) {
      console.error("Delete link error", error.message)
      throw new Error(error.message || "An error occurred")
    }

    else {
      return {
        success: true,
        message: "Delete link successful"
      }
    }

  } catch (error) {
    console.error("Delete link error", error)
    return {
      success: false,
      message: "Delete link error"
    }
  }
}

export async function createCommunity(creatorID: string, formData: z.infer<typeof CreateCommunitySchema>) {
  const supabase = await createClient()

  try {
    const { data: community, error: createCommunityError } = await supabase.from('communities').insert({
      creator_id: creatorID,
      community_name: formData.name,
      community_name_lower: formData.name.toLowerCase(),
      description: formData.description,
      type: formData.type,
      topics: formData.topics ?? []
    }).select()

    if (createCommunityError) {
      console.error("Create community error", createCommunityError.message)
      throw new Error(createCommunityError.message || "An error occurred")
    }

    else {
      if (community && community.length > 0) {
        const addModerator = await addCommunityModerator(creatorID, community[0].id)
        if (addModerator.success) {
          const createMembership = await createCommunityMembership(creatorID, community[0].id)
          if (createMembership.success) {
            return {
              success: true,
              message: "create community successful",
              data: community[0]
            }
          }
          else {
            return {
              success: false,
              message: createMembership.message
            }
          }
        }
        else {
          return {
            success: false,
            message: addModerator.message
          }
        }
      }
    }

  } catch (error) {
    console.error("Create community error", error)
    return {
      success: false,
      message: "Create community error"
    }
  }

}

export async function addCommunityModerator(userID: string, communityID: string) {
  const supabase = await createClient()

  try {
    const { error: addCommunityModeratorError } = await supabase.from('community_moderators').insert({
      community_id: communityID,
      user_id: userID
    })

    if (addCommunityModeratorError) {
      console.error("Add community moderato error", addCommunityModeratorError.message)
      throw new Error(addCommunityModeratorError.message || "An error occurred")
    }

    else {
      return {
        success: true,
        message: "Add community moderator successful"
      }
    }

  } catch (error) {
    console.error("Add community moderator error", error)
    return {
      success: false,
      message: "Add community moderator error"
    }
  }

}

export async function createCommunityMembership(userID: string, communityID: string) {
  const supabase = await createClient()

  try {
    const { error: createCommunityMembershipError } = await supabase.from('community_memberships').insert({
      user_id: userID,
      community_id: communityID
    })

    if (createCommunityMembershipError) {
      console.error("create community membership error", createCommunityMembershipError.message)
      throw new Error(createCommunityMembershipError.message || "An error occurred")
    }

    else {
      return {
        success: true,
        message: 'create community membership successful'
      }
    }

  } catch (error) {
    console.error("create community membership error", error)
    return {
      success: false,
      message: 'create community membership error'
    }
  }
}

export async function addCommunityBannerAndAvatar(communityID: string, avatarUrl: string | undefined, bannerUrl: string | undefined) {
  const supabase = await createClient()

  try {
    const { error } = await supabase.from('communities').update({
      image_url: avatarUrl,
      banner_url: bannerUrl
    }).eq('id', communityID)

    if (error) {
      console.error("Add community banner and avatar error", error.message)
      throw new Error(error.message || "An error occurred")
    }

    else {
      return {
        success: true,
        message: "Community banner and avatar added successfully"
      }
    }

  }

  catch (error) {
    console.error("Add community banner and avatar error", error)
    return {
      success: false,
      message: 'Add community banner and avatar error'
    }
  }
}

export async function fetchCommunityByName(communityName: string) {
  const supabase = await createClient()

  try {
    const { data, error } = await supabase.from("communities")
      .select(`*, users(*),community_moderators(*),community_memberships(count)`)
      .eq('community_name_lower', communityName.toLowerCase()).single()

    if (error) {
      return {
        success: false,
        message: error.message
      }
    }
    else {
      return {
        success: true,
        message: "Community fetched successfully",
        data: data
      }
    }
  }
  catch (error) {
    console.error("Fetch community error", error)
    return {
      success: false,
      message: "Fetch community error"
    }
  }
}

export async function removeCommunityMembership(userID: string, communityID: string) {
  const supabase = await createClient()

  try {
    const { error: removeCommunityMembershipError } = await supabase.from('community_memberships').delete()
      .eq('user_id', userID).eq('community_id', communityID)

    if (removeCommunityMembershipError) {
      console.error("remove community membership error", removeCommunityMembershipError.message)
      throw new Error(removeCommunityMembershipError.message || "An error occurred")
    }

    else {
      return {
        success: true,
        message: 'remove community membership successful'
      }
    }

  } catch (error) {
    console.error("remove community membership error", error)
    return {
      success: false,
      message: 'remove community membership error'
    }
  }
}

export async function fetchAllCommunities(page = 1, pageSize = 100) {
  const supabase = await createClient()
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  try {
    const { data, error, count } = await supabase.from('communities')
      .select("community_name, description, image_url, banner_url, community_memberships(count)", { count: 'exact' })
      .order('created_at', { ascending: true })
      .range(from, to)

    if (error) {
      console.error("Fetch communities error", error.message)
      throw new Error(error.message || "An error occurred")
    }

    return {
      success: true,
      message: "Communities fetched successfully",
      data: data,
      count: count ?? 0,
    }

  } catch (error) {
    console.error("Fetch communities error", error)
    return {
      success: false,
      message: "Fetch communities error",
      data: null,
      count: 0,
    }
  }
}

export async function updateCommunityDetails(values: z.infer<typeof ManageDetailsWidgetSchema>, communityID: string) {
  const supabase = await createClient()

  try {
    const { error } = await supabase.from('communities')
      .update({
        display_name: values.displayName, members_nickname: values.membersNickname,
        currently_viewing_nickname: values.currentlyViewingNickname,
        description: values.description
      }).eq('id', communityID)

    if (error) {
      console.error("Update community details error", error.message)
      throw new Error(error.message || "An error occurred")
    }

    else {
      return {
        success: true,
        message: "Community details update successful"
      }
    }

  } catch (error) {
    console.error("Update community details error", error)
    return {
      success: false,
      message: "Update community details error"
    }
  }
}

export async function selectCommunity(name: string) {
  const supabase = await createClient()

  try {
    const { data, error } = await supabase.from("communities").select().ilike("community_name", `%${name}%`)
    if (error) {
      console.error("Select community error", error.message)
      throw new Error(error.message || "An error occurred")
    }
    else {
      return {
        success: true,
        message: "Community selected successfully",
        data: data
      }
    }
  } catch (error) {
    console.error("Select community error", error)
    return {
      success: false,
      message: "Select community error"
    }
  }
}

export async function generateSlug(title: string) {
  const slug = title.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
    .slice(0, 80)
  const id = nanoid(7)
  return `${id}-${slug}`
}

export async function createTextPost(communityID: string, authorID: string, post: z.infer<typeof TextPostSchema>) {
  const supabase = await createClient()

  try {
    const slug = await generateSlug(post.title)
    const { data, error } = await supabase.from('posts').insert({
      community_id: communityID,
      author_id: authorID,
      title: post.title,
      content: post.body,
      post_type: "text",
      slug: slug
    }).select('slug').single()

    if (error) {
      console.error("Create text post error", error.message)
      throw new Error(error.message || "An error occurred")
    }

    else {
      return {
        success: true,
        message: "Text post created successfully",
        data
      }
    }

  } catch (error) {
    console.error("Create text post error", error)
    return {
      success: false,
      message: "Create text post error"
    }
  }
}

export async function managePostVotes(voterID: string, postID: string, voteType: string) {
  const supabase = await createClient()

  try {
    const { data, error } = await supabase.from('posts_votes').upsert({
      voter_id: voterID,
      post_id: postID,
      vote_type: voteType,
    }, { onConflict: 'post_id, voter_id' }).select('*').single()

    if (error) {
      console.error("Vote upsert error", error.message)
      throw new Error(error.message || "An error occurred")
    }

    // Upvote notification (awaited)
    if (voteType === 'upvote') {
      try {
        const admin = getSupabaseAdmin()
        const [{ data: post }, { data: actor }] = await Promise.all([
          admin.from('posts').select('author_id, slug, communities(community_name)').eq('id', postID).single(),
          admin.from('users').select('username').eq('account_id', voterID).single(),
        ])
        if (post && post.author_id !== voterID) {
          // Avoid duplicate notifications
          const { data: existing } = await admin
            .from('notifications')
            .select('id')
            .eq('user_id', post.author_id)
            .eq('actor_id', voterID)
            .eq('type', 'post_upvote')
            .eq('post_id', postID)
            .maybeSingle()
          if (!existing) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const communityName = (post.communities as any)?.community_name ?? null
            await admin.from('notifications').insert({
              user_id: post.author_id,
              actor_id: voterID,
              actor_username: actor?.username ?? null,
              type: 'post_upvote',
              post_id: postID,
              post_slug: post.slug,
              community_name: communityName,
            })
          }
        }
      } catch (e) {
        console.error('Notification error', e)
      }
    }

    return {
      success: true,
      message: "Vote upsert successful",
      data: data
    }

  } catch (error) {
    console.error("Vote upsert error", error)
    return {
      success: false,
      message: "Vote upsert error"
    }
  }
}

export async function removeVote(voteID: string) {
  const supabase = await createClient()

  try {
    const { error } = await supabase.from('posts_votes').delete().eq('id', voteID)

    if (error) {
      console.error("Vote remove error", error.message)
      throw new Error(error.message || "An error occurred")
    }

    else {
      return {
        success: true,
        message: "Vote removed successfully"
      }
    }

  } catch (error) {
    console.error("Vote remove error", error)
    return {
      success: false,
      message: "Vote remove error"
    }
  }
}

export async function deletePost(postID: string) {
  const supabase = await createClient()

  try {
    const { error } = await supabase.from('posts').delete().eq('id', postID)

    if (error) {
      console.error("Post delete error", error.message)
      throw new Error(error.message || "An error occurred")
    }

    else {
      return {
        success: true,
        message: "Post deleted successfully"
      }
    }

  } catch (error) {
    console.error("Post delete error", error)
    return {
      success: false,
      message: "Post delete error"
    }
  }

}

export async function createLinkPost(post: z.infer<typeof LinkPostSchema>, authorID: string, communityID: string) {
  const supabase = await createClient()
  try {
    const slug = await generateSlug(post.title)
    const { data, error } = await supabase.from('posts').insert({
      community_id: communityID,
      author_id: authorID,
      title: post.title,
      post_type: "link",
      url: post.link,
      slug: slug
    }).select('*').single()

    if (error) {
      console.error("Create link post error", error.message)
      throw new Error(error.message || "An error occurred")
    }
    else {
      return {
        success: true,
        message: "Link post created successfully",
        data
      }
    }

  } catch (error) {
    console.error("Create link post error", error)
    return {
      success: false,
      message: "Create link post error"
    }
  }
}

export async function fetchPostBySlug(slug: string) {
  const supabase = await createClient()

  try {
    const { data, error } = await supabase.from('posts')
      .select("*, users(username,avatar_url, verified), posts_votes(vote_type, voter_id, id), post_attachments(*), communities(community_name, verified, image_url), comments(count)")
      .eq('slug', slug).maybeSingle()

    if (error) {
      console.error("Post fetch error", error.message)
      throw new Error(error.message || "An error occurred")
    }

    else {
      return {
        success: true,
        message: 'Post fetched successfully',
        data: data
      }
    }

  } catch (error) {
    console.error("Post fetch error", error)
    return {
      success: false,
      message: "Post fetch error"
    }
  }
}


export async function manageCommentVotes(voterID: string, commentID: string, voteType: string) {
  const supabase = await createClient()

  try {
    const { data, error } = await supabase.from('comments_votes').upsert({
      voter_id: voterID,
      comment_id: commentID,
      vote_type: voteType,
    }, { onConflict: 'comment_id, voter_id' }).select('*').single()

    if (error) {
      console.error("Vote upsert error", error.message)
      throw new Error(error.message || "An error occurred")
    }

    else {
      return {
        success: true,
        message: "Vote upsert successful",
        data: data
      }
    }

  } catch (error) {
    console.error("Vote upsert error", error)
    return {
      success: false,
      message: "Vote upsert error"
    }
  }
}

export async function removeCommentVote(voteID: string) {
  const supabase = await createClient()

  try {
    const { error } = await supabase.from('comments_votes').delete().eq('id', voteID)

    if (error) {
      console.error("Vote remove error", error.message)
      throw new Error(error.message || "An error occurred")
    }

    else {
      return {
        success: true,
        message: "Vote removed successfully"
      }
    }

  } catch (error) {
    console.error("Vote remove error", error)
    return {
      success: false,
      message: "Vote remove error"
    }
  }
}

export async function fetchCommentSorted(sortBy: 'best' | 'new' | 'old' | 'controversial', postID: string) {
  const supabase = await createClient()

  switch (sortBy) {

    case 'best':
      const { data: sortByBest, error: sortByBestError } = await supabase
        .rpc('get_comments_by_best', { post: postID })

      if (sortByBestError) {
        console.error("Best comments error", sortByBestError)
        return { success: false, data: [] }
      }

      return { success: true, data: sortByBest }

    case 'new':
      const { data: sortByNew, error: sortByNewError } = await supabase.from('comments')
        .select(`*, users(username, avatar_url, verified), comments_votes(vote_type, voter_id, id)`)
        .eq('post_id', postID).order('created_at', { ascending: false })

      if (sortByNewError) {
        console.error("Fallback comments error", sortByNewError)
        return { success: false, data: [] }
      }

      return { success: true, data: sortByNew }

    case 'old':
      const { data: sortByOld, error: sortByOldError } = await supabase.from('comments')
        .select(`*, users(username, avatar_url, verified), comments_votes(vote_type, voter_id, id)`)
        .eq('post_id', postID).order('created_at', { ascending: true })

      if (sortByOldError) {
        console.error("Fallback comments error", sortByOldError)
        return { success: false, data: [] }
      }

      return { success: true, data: sortByOld }

    case 'controversial':
      const { data: sortByControversial, error: sortByControversialError } = await supabase
        .rpc('get_comments_by_controversial', { post: postID })

      if (sortByControversialError) {
        console.error("Controversial comments error", sortByControversialError)
        return { success: false, data: [] }
      }
      return { success: true, data: sortByControversial }

    default:
      break;
  }

}

export async function flagCommentAsDeleted(commentID: string) {
  const supabase = await createClient()

  try {
    const { error } = await supabase.from('comments').update({
      deleted: true
    }).eq('id', commentID)

    if (error) {
      console.error("Comment delete error", error.message)
      throw new Error(error.message || "An error occurred")
    }

    else {
      return {
        success: true,
        message: "Comment deleted successfully"
      }
    }

  } catch (error) {
    console.error("Comment delete error", error)
    return {
      success: false,
      message: "Comment delete error"
    }
  }
}

export async function deleteComment(commentID: string) {
  const supabase = await createClient()

  try {
    const { error } = await supabase.from('comments').delete().eq('id', commentID)

    if (error) {
      console.error("Comment delete error", error.message)
      throw new Error(error.message || "An error occurred")
    }

    else {
      return {
        success: true,
        message: "Comment deleted successfully"
      }
    }

  } catch (error) {
    console.error("Comment delete error", error)
    return {
      success: false,
      message: "Comment delete error"
    }
  }

}

export async function fetchCommentBySlug(slug: string) {
  const supabase = await createClient()

  try {

    const { data, error } = await supabase.from('comments').select('*').eq('slug', slug).maybeSingle()

    if (error) {
      console.error("Comment fetch error", error.message)
      throw new Error(error.message || "An error occurred")
    }

    else {
      return {
        success: true,
        message: "Comment fetched successfully",
        data: data
      }
    }

  } catch (error) {
    console.error("Comment fetch error", error)
    return {
      success: false,
      message: "Comment fetch error"
    }
  }

}

export async function searchComments(body: string, postID: string): Promise<{
  success: boolean;
  message: string;
  data?: CommentWithAuthor[];
}> {
  const supabase = await createClient()

  try {
    const { data, error } = await supabase.from('comments')
      .select(`*, users(username, avatar_url, verified), comments_votes(vote_type, voter_id, id)`)
      .eq('post_id', postID).ilike('stripped_body', `%${body}%`);

    if (error) {
      console.error("Comment search error", error.message)
      throw new Error(error.message || "An error occurred")
    }

    else {
      return {
        success: true,
        message: 'Comment found successfully',
        data: data as CommentWithAuthor[]
      }
    }

  } catch (error) {
    console.error("Comment search error", error)
    return {
      success: false,
      message: "Comment search error"
    }
  }
}

export async function flagPostDeleted(postID: string) {
  const supabase = await createClient()

  try {
    const { error } = await supabase.from('posts').update({
      deleted: true
    }).eq('id', postID)

    if (error) {
      console.error("Post delete error", error.message)
      throw new Error(error.message || "An error occurred")
    }

    else {
      return {
        success: true,
        message: "Post deleted successfully"
      }
    }

  } catch (error) {
    console.error("Post delete error", error)
    return {
      success: false,
      message: "Post delete error"
    }
  }

}

export async function upsertRecentlyVisitedCommunity(communityID: string, userID: string) {
  const supabase = await createClient()

  try {
    const { error } = await supabase.from('recently_visited_communities').upsert({
      community_id: communityID,
      user_id: userID
    }, { onConflict: 'user_id, community_id' })

    if (error) {
      console.error("Community history upsert error", error.message)
      throw new Error(error.message || "An error occurred")
    }

    else {
      return {
        success: true,
        message: "Community history updated successfully"
      }
    }

  } catch (error) {
    console.error("Community history upsert error", error)
    return {
      success: false,
      message: "Post delete error"
    }
  }
}

export async function upsertVisitedPost(postID: string, userID: string, communityID: string) {
  const supabase = await createClient()

  try {
    const { error } = await supabase.rpc('track_post_visit', {
      p_user_id: userID,
      p_post_id: postID,
      p_community_id: communityID,

    })

    if (error) {
      console.error("Post history upsert error", error.message)
      throw new Error(error.message || "An error occurred")
    }

    else {
      return {
        success: true,
        message: "Post history updated successfully"
      }
    }

  } catch (error) {
    console.error("Post history upsert error", error)
    return {
      success: false,
      message: "Post delete error"
    }
  }
}

export async function clearRecentlyVisitedPosts(userID: string) {
  const supabase = await createClient()
  try {
    const { error } = await supabase.from('recently_visited_posts').delete().eq('user_id', userID)

    if (error) {
      console.error("Posts history delete error", error.message)
      throw new Error(error.message || "An error occurred")
    }

    else {
      return {
        success: true,
        message: "Posts history deleted successfully"
      }
    }

  } catch (error) {
    console.error("Posts history delete error", error)
    return {
      success: false,
      message: "Posts delete error"
    }
  }
}

export async function searchPosts(
  query: string,
  sort: string = "relevance",
  timeFilter: string = "all",
  communityName?: string
) {
  const supabase = await createClient();
  if (!query.trim()) return { data: [], error: null };

  let dbQuery = supabase
    .from("posts")
    .select(
      "*, users(username, avatar_url, verified), posts_votes(vote_type, voter_id, id), post_attachments(*), communities(community_name, verified, image_url), comments(count)"
    )
    .eq("deleted", false)
    .or(`title.ilike.%${query}%,content.ilike.%${query}%`);

  if (communityName) {
    const { data: community } = await supabase
      .from("communities")
      .select("id")
      .eq("community_name", communityName)
      .single();
    if (community) dbQuery = dbQuery.eq("community_id", community.id);
  }

  if (timeFilter !== "all") {
    const daysMap: Record<string, number> = { year: 365, month: 30, week: 7, day: 1 };
    const days = daysMap[timeFilter] ?? 365;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    dbQuery = dbQuery.gte("created_at", cutoff.toISOString());
  }

  if (sort === "new") {
    dbQuery = dbQuery.order("created_at", { ascending: false });
  } else {
    dbQuery = dbQuery.order("net_votes", { ascending: false });
  }

  return dbQuery.limit(25);
}

export async function searchCommunities(query: string) {
  const supabase = await createClient();
  if (!query.trim()) return { data: [], error: null };

  return supabase
    .from("communities")
    .select("*, community_memberships(count)")
    .or(
      `community_name.ilike.%${query}%,display_name.ilike.%${query}%,description.ilike.%${query}%`
    )
    .order("community_name_lower", { ascending: true })
    .limit(25);
}

export async function searchUsers(query: string) {
  const supabase = await createClient();
  if (!query.trim()) return { data: [], error: null };

  return supabase
    .from("users")
    .select(
      "account_id, username, display_name, avatar_url, description, post_karma, comment_karma, verified"
    )
    .or(`username.ilike.%${query}%,display_name.ilike.%${query}%`)
    .order("username", { ascending: true })
    .limit(25);

}

export async function getRecentSearches() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { data: null, authenticated: false }

  const { data, error } = await supabase
    .from("recent_searches")
    .select("query")
    .eq("user_id", user.id)
    .order("searched_at", { ascending: false })
    .limit(5)

  if (error) return { data: null, authenticated: true, error }
  return { data: data.map((r) => r.query), authenticated: true }
}

export async function saveRecentSearch(query: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { authenticated: false }

  await supabase
    .from("recent_searches")
    .upsert(
      { user_id: user.id, query: query.trim(), searched_at: new Date().toISOString() },
      { onConflict: "user_id,query" }
    )

  // Keep only the 5 most recent per user
  const { data: all } = await supabase
    .from("recent_searches")
    .select("id, searched_at")
    .eq("user_id", user.id)
    .order("searched_at", { ascending: false })

  if (all && all.length > 5) {
    const toDelete = all.slice(5).map((r) => r.id)
    await supabase.from("recent_searches").delete().in("id", toDelete)
  }

  return { authenticated: true }
}

export async function deleteRecentSearch(query: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { authenticated: false }

  await supabase
    .from("recent_searches")
    .delete()
    .eq("user_id", user.id)
    .eq("query", query.trim())

  return { authenticated: true }
}

export async function clearAllRecentSearches() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { authenticated: false }

  await supabase.from("recent_searches").delete().eq("user_id", user.id)
  return { authenticated: true }
}

export async function getTrendingCommunities() {
  const supabase = await createClient()
  const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

  const { data: recentPosts, error } = await supabase
    .from("posts")
    .select("community_id, communities(id, community_name, image_url, community_memberships(count))")
    .eq("deleted", false)
    .gte("created_at", cutoff)
    .order("net_votes", { ascending: false })
    .limit(50)

  if (error || !recentPosts) return { data: [], error }

  const seen = new Set<string>()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const communities: any[] = []

  for (const post of recentPosts) {
    if (!post.communities) continue
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const c = post.communities as any
    if (!seen.has(c.id)) {
      seen.add(c.id)
      communities.push(c)
      if (communities.length >= 5) break
    }
  }

  return { data: communities, error: null }
}

export async function getTrendingPosts() {
  const supabase = await createClient()
  const result = await supabase.rpc("get_posts_hot", { from_offset: 0, to_offset: 4 })
  return { data: result.data ?? [], error: result.error }
}

export async function toggleSavePost(postId: string) {
  const supabase = await createClient()
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, message: "Not authenticated", saved: false }

    const { data: existing } = await supabase
      .from('saved_posts')
      .select('id')
      .eq('user_id', user.id)
      .eq('post_id', postId)
      .maybeSingle()

    if (existing) {
      const { error } = await supabase.from('saved_posts').delete().eq('user_id', user.id).eq('post_id', postId)
      if (error) throw new Error(error.message)
      return { success: true, saved: false }
    } else {
      const { error } = await supabase.from('saved_posts').insert({ user_id: user.id, post_id: postId })
      if (error) throw new Error(error.message)
      return { success: true, saved: true }
    }
  } catch (error) {
    console.error("Toggle save post error", error)
    return { success: false, message: "An error occurred", saved: false }
  }
}

export async function toggleHidePost(postId: string) {
  const supabase = await createClient()
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, message: "Not authenticated", hidden: false }

    const { data: existing } = await supabase
      .from('hidden_posts')
      .select('id')
      .eq('user_id', user.id)
      .eq('post_id', postId)
      .maybeSingle()

    if (existing) {
      const { error } = await supabase.from('hidden_posts').delete().eq('user_id', user.id).eq('post_id', postId)
      if (error) throw new Error(error.message)
      return { success: true, hidden: false }
    } else {
      const { error } = await supabase.from('hidden_posts').insert({ user_id: user.id, post_id: postId })
      if (error) throw new Error(error.message)
      return { success: true, hidden: true }
    }
  } catch (error) {
    console.error("Toggle hide post error", error)
    return { success: false, message: "An error occurred", hidden: false }
  }
}

export async function createComment(
  creatorId: string,
  postId: string,
  parentId: string,
  body: string,
  strippedBody: string,
  slug: string,
  postSlug: string,
  communityName: string,
  actorUsername: string
) {
  const supabase = await createClient()

  // Verify the caller is who they claim to be
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.id !== creatorId) {
    return { success: false as const, message: 'Unauthorized' }
  }

  try {
    const { data, error } = await supabase.from('comments').insert({
      creator_id: creatorId,
      post_id: postId,
      parent_id: parentId || null,
      body,
      stripped_body: strippedBody,
      slug,
    }).select().single()

    if (error) throw new Error(error.message)

    // Auto-upvote own comment
    const { error: voteError } = await supabase.from('comments_votes').insert({
      voter_id: creatorId,
      comment_id: data.id,
      vote_type: 'upvote',
    })
    if (voteError) console.error('Auto-vote error', voteError)

    const { data: commentVotes, error: votesError } = await supabase
      .from('comments_votes')
      .select('id, vote_type, voter_id')
      .eq('comment_id', data.id)

    if (votesError) throw new Error(votesError.message)

    // Send notifications (awaited so they complete before returning)
    try {
      const admin = getSupabaseAdmin()

      const notified = new Set<string>([creatorId]) // never notify the commenter themselves

      const isTopLevel = !parentId

      const [parentCommentResult, followersResult, postResult] = await Promise.all([
        isTopLevel
          ? Promise.resolve({ data: null })
          : admin.from('comments').select('creator_id').eq('id', parentId).single(),
        isTopLevel
          ? Promise.resolve({ data: [] })
          : admin.from('comment_follows').select('user_id').eq('comment_id', parentId),
        admin.from('posts').select('author_id').eq('id', postId).single(),
      ])

      const parentComment = parentCommentResult.data
      const followers = followersResult.data ?? []
      const postAuthorId = (postResult.data as { author_id: string } | null)?.author_id

      // Notify post author with post_comment (for any comment on their post)
      if (postAuthorId && !notified.has(postAuthorId)) {
        notified.add(postAuthorId)
        await admin.from('notifications').insert({
          user_id: postAuthorId,
          actor_id: creatorId,
          actor_username: actorUsername,
          type: 'post_comment',
          post_id: postId,
          comment_id: data.id,
          post_slug: postSlug,
          community_name: communityName,
        })
      }

      // Notify parent comment author with comment_reply (for replies only)
      if (parentComment && !notified.has(parentComment.creator_id)) {
        notified.add(parentComment.creator_id)
        await admin.from('notifications').insert({
          user_id: parentComment.creator_id,
          actor_id: creatorId,
          actor_username: actorUsername,
          type: 'comment_reply',
          post_id: postId,
          comment_id: data.id,
          post_slug: postSlug,
          community_name: communityName,
        })
      }

      // Notify followers of the parent comment (skip anyone already notified)
      const followerIds = followers.map((f: { user_id: string }) => f.user_id).filter((id: string) => !notified.has(id))
      if (followerIds.length > 0) {
        await admin.from('notifications').insert(
          followerIds.map((userId: string) => ({
            user_id: userId,
            actor_id: creatorId,
            actor_username: actorUsername,
            type: 'comment_follow_reply',
            post_id: postId,
            comment_id: data.id,
            post_slug: postSlug,
            community_name: communityName,
          }))
        )
      }
    } catch (e) {
      console.error('Notification error', e)
    }

    return {
      success: true,
      data,
      votes: commentVotes ?? [],
    }
  } catch (error) {
    console.error('Create comment error', error)
    return { success: false as const, message: 'An error occurred' }
  }
}

export async function markNotificationsRead(notificationIds: string[]) {
  const supabase = await createClient()
  if (!notificationIds.length) return { success: true }
  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .in('id', notificationIds)
  if (error) {
    console.error('Mark notifications read error', error)
    return { success: false }
  }
  return { success: true }
}

export async function toggleCommentFollow(commentId: string) {
  const supabase = await createClient()
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, following: false }

    const { data: existing } = await supabase
      .from('comment_follows')
      .select('id')
      .eq('user_id', user.id)
      .eq('comment_id', commentId)
      .maybeSingle()

    if (existing) {
      const { error } = await supabase.from('comment_follows').delete().eq('id', existing.id)
      if (error) throw new Error(error.message)
      return { success: true, following: false }
    } else {
      const { error } = await supabase.from('comment_follows').insert({ user_id: user.id, comment_id: commentId })
      if (error) throw new Error(error.message)
      return { success: true, following: true }
    }
  } catch (error) {
    console.error('Toggle comment follow error', error)
    return { success: false, following: false }
  }
}

export async function toggleNotificationRead(notificationId: string, read: boolean) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('notifications')
    .update({ read })
    .eq('id', notificationId)
  if (error) {
    console.error('Toggle notification read error', error)
    return { success: false }
  }
  return { success: true }
}

// ─── Messaging ───────────────────────────────────────────────────────────────

export type ConversationSummary = {
  id: string
  otherUser: { account_id: string; username: string | null; avatar_url: string | null } | null
  lastMessage: { content: string; sender_id: string; created_at: string; deleted: boolean } | null
  unreadCount: number
}

export type MessageWithSender = {
  id: string
  conversation_id: string
  sender_id: string
  content: string
  edited: boolean
  deleted: boolean
  created_at: string
  updated_at: string
  sender: { username: string | null; avatar_url: string | null } | null
}

export async function getConversations(): Promise<ConversationSummary[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []
  const admin = getSupabaseAdmin()

  const { data: myParts } = await admin
    .from('conversation_participants').select('conversation_id, last_read_at').eq('user_id', user.id)
  if (!myParts?.length) return []

  const convIds = myParts.map(p => p.conversation_id)
  const lastReadMap = Object.fromEntries(myParts.map(p => [p.conversation_id, p.last_read_at]))

  const { data: otherParts } = await admin
    .from('conversation_participants').select('conversation_id, user_id')
    .in('conversation_id', convIds).neq('user_id', user.id)

  const otherIds = [...new Set((otherParts ?? []).map(p => p.user_id))]
  const { data: userRows } = otherIds.length
    ? await admin.from('users').select('account_id, username, avatar_url').in('account_id', otherIds)
    : { data: [] }

  const userMap = Object.fromEntries((userRows ?? []).map(u => [u.account_id, u]))
  const otherPartMap = Object.fromEntries((otherParts ?? []).map(p => [p.conversation_id, p.user_id]))

  const results = await Promise.all(convIds.map(async (convId) => {
    const { data: msgs } = await admin.from('messages').select('content, sender_id, created_at, deleted')
      .eq('conversation_id', convId).order('created_at', { ascending: false }).limit(1)
    const lastRead = lastReadMap[convId]
    const { count } = await admin.from('messages').select('*', { count: 'exact', head: true })
      .eq('conversation_id', convId).neq('sender_id', user.id).eq('deleted', false)
      .gt('created_at', lastRead ?? '1970-01-01T00:00:00Z')
    const otherUserId = otherPartMap[convId]
    return {
      id: convId,
      otherUser: otherUserId ? (userMap[otherUserId] ?? null) : null,
      lastMessage: msgs?.[0] ?? null,
      unreadCount: count ?? 0,
    }
  }))

  return results.sort((a, b) =>
    (b.lastMessage?.created_at ?? '').localeCompare(a.lastMessage?.created_at ?? '')
  )
}

export async function getOrCreateConversation(otherUserId: string): Promise<{ id: string } | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.id === otherUserId) return null
  const admin = getSupabaseAdmin()

  // Find existing conversation between the two users
  const { data: myConvs } = await admin.from('conversation_participants')
    .select('conversation_id').eq('user_id', user.id)
  const { data: theirConvs } = await admin.from('conversation_participants')
    .select('conversation_id').eq('user_id', otherUserId)

  const myIds = new Set((myConvs ?? []).map(c => c.conversation_id))
  const existing = (theirConvs ?? []).find(c => myIds.has(c.conversation_id))
  if (existing) return { id: existing.conversation_id }

  // Create new conversation
  const { data: conv, error } = await admin.from('conversations').insert({}).select('id').single()
  if (error || !conv) return null
  await admin.from('conversation_participants').insert([
    { conversation_id: conv.id, user_id: user.id },
    { conversation_id: conv.id, user_id: otherUserId },
  ])
  return { id: conv.id }
}

export async function getMessages(conversationId: string): Promise<MessageWithSender[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []
  const admin = getSupabaseAdmin()

  const { data: part } = await admin.from('conversation_participants')
    .select('user_id').eq('conversation_id', conversationId).eq('user_id', user.id).maybeSingle()
  if (!part) return []

  const { data: msgs } = await admin.from('messages').select('*')
    .eq('conversation_id', conversationId).order('created_at', { ascending: true }).limit(100)
  if (!msgs?.length) return []

  const senderIds = [...new Set(msgs.map(m => m.sender_id))]
  const { data: senders } = await admin.from('users')
    .select('account_id, username, avatar_url').in('account_id', senderIds)
  const senderMap = Object.fromEntries((senders ?? []).map(s => [s.account_id, s]))

  return msgs.map(m => ({ ...m, sender: senderMap[m.sender_id] ?? null }))
}

export async function sendMessage(conversationId: string, content: string): Promise<{ success: boolean; data?: MessageWithSender }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false }
  const admin = getSupabaseAdmin()

  // Verify participant
  const { data: part } = await admin.from('conversation_participants')
    .select('user_id').eq('conversation_id', conversationId).eq('user_id', user.id).maybeSingle()
  if (!part) return { success: false }

  const { data: msg, error } = await admin.from('messages')
    .insert({ conversation_id: conversationId, sender_id: user.id, content: content.trim() })
    .select().single()
  if (error || !msg) return { success: false }

  // Update conversation last_message_at
  await admin.from('conversations').update({ last_message_at: msg.created_at }).eq('id', conversationId)

  const { data: senderRow } = await admin.from('users')
    .select('username, avatar_url').eq('account_id', user.id).single()

  return { success: true, data: { ...msg, sender: senderRow ?? null } }
}

export async function editMessage(messageId: string, content: string): Promise<{ success: boolean }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false }

  const { error } = await supabase.from('messages')
    .update({ content: content.trim(), edited: true, updated_at: new Date().toISOString() })
    .eq('id', messageId).eq('sender_id', user.id)
  return { success: !error }
}

export async function deleteMessage(messageId: string): Promise<{ success: boolean }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false }

  const { error } = await supabase.from('messages')
    .update({ deleted: true, updated_at: new Date().toISOString() })
    .eq('id', messageId).eq('sender_id', user.id)
  return { success: !error }
}

export async function markConversationRead(conversationId: string): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return
  await supabase.from('conversation_participants')
    .update({ last_read_at: new Date().toISOString() })
    .eq('conversation_id', conversationId).eq('user_id', user.id)
}

export async function getUserByUsername(username: string) {
  const admin = getSupabaseAdmin()
  const { data } = await admin.from('users')
    .select('account_id, username, avatar_url').eq('username_lower', username.toLowerCase()).maybeSingle()
  return data ?? null
}

export async function getOtherLastRead(conversationId: string): Promise<string | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const admin = getSupabaseAdmin()
  const { data } = await admin
    .from('conversation_participants')
    .select('user_id, last_read_at')
    .eq('conversation_id', conversationId)
    .neq('user_id', user.id)
    .maybeSingle()
  return data?.last_read_at ?? null
}

export async function toggleSaveComment(commentId: string) {
  const supabase = await createClient()
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, message: "Not authenticated", saved: false }

    const { data: existing } = await supabase
      .from('saved_comments')
      .select('id')
      .eq('user_id', user.id)
      .eq('comment_id', commentId)
      .maybeSingle()

    if (existing) {
      const { error } = await supabase.from('saved_comments').delete().eq('user_id', user.id).eq('comment_id', commentId)
      if (error) throw new Error(error.message)
      return { success: true, saved: false }
    } else {
      const { error } = await supabase.from('saved_comments').insert({ user_id: user.id, comment_id: commentId })
      if (error) throw new Error(error.message)
      return { success: true, saved: true }
    }
  } catch (error) {
    console.error("Toggle save comment error", error)
    return { success: false, message: "An error occurred", saved: false }
  }
}