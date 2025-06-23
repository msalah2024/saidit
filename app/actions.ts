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
      type: formData.type
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

export async function fetchAllCommunities() {
  const supabase = await createClient()

  try {
    const { data, error } = await supabase.from('communities')
      .select("community_name, description, image_url, banner_url, community_memberships(count)")

    if (error) {
      console.error("Fetch communities error", error.message)
      throw new Error(error.message || "An error occurred")
    }

    else {
      return {
        success: true,
        message: "Communities fetched successfully",
        data: data
      }
    }

  } catch (error) {
    console.error("Fetch communities error", error)
    return {
      success: false,
      message: "Fetch communities error"
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

export async function createTextPost(communityID: string, authorID: string, post: z.infer<typeof TextPostSchema>) {
  const supabase = await createClient()

  try {
    const { error } = await supabase.from('posts').insert({
      community_id: communityID,
      author_id: authorID,
      title: post.title,
      content: post.body,
      post_type: "text",
    })

    if (error) {
      console.error("Create text post error", error.message)
      throw new Error(error.message || "An error occurred")
    }

    else {
      return {
        success: true,
        message: "Text post created successfully"
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

    const { error } = await supabase.from('posts').insert({
      community_id: communityID,
      author_id: authorID,
      title: post.title,
      post_type: "link",
      url: post.link
    }).select('*').single()

    if (error) {
      console.error("Create link post error", error.message)
      throw new Error(error.message || "An error occurred")
    }
    else {
      return {
        success: true,
        message: "Link post created successfully"
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