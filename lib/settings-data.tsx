import React from "react"

interface AccountSettingsCategory {
    id: string
    name: string
    description?: string | React.ReactNode
}

export const accountSettingsCategories: AccountSettingsCategory[] = [
    {
        id: "Email address",
        name: "Email address",
        description: "We'll send a verification email to the email address you provide to confirm that it's really you.",
    },
    {
        id: "Password",
        name: "Password",
    },
    {
        id: "Gender",
        name: "Gender",
        description: "This information may be used to improve your recommendations and ads.",
    },
    {
        id: "Delete account",
        name: "Delete account",
        description: "Once you delete your account, your profile and username are permanently removed from Saidit and your posts, comments, and messages are deleted from your account",
    }
]