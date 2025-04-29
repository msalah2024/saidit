
interface AccountSettingsCategory {
    id: string
    name: string
    description?: string | React.ReactNode
}

interface ProfileSettingsCategory {
    id: string
    name: string
    description?: string | React.ReactNode
    buttonDescription?: string
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
        description: "To continue, confirm your password"
    },
    {
        id: "Gender",
        name: "Gender",
        description: "This information may be used to improve your recommendations and ads.",
    },
    {
        id: "Connect discord",
        name: "Discord",
        description: "To continue, confirm your password"
    },
    {
        id: "Connect google",
        name: "Google",
        description: "To continue, confirm your password"
    },
    {
        id: "Delete account",
        name: "Delete account",
        description: "Once you delete your account, your profile and username are permanently removed from Saidit and your posts, comments, and messages are deleted from your account",
    }
]

export const profileSettingsCategories: ProfileSettingsCategory[] = [
    {
        id: "Display name",
        name: "Display name",
        description: "Changing your display name won't change your username",
        buttonDescription: "Changing your display name won't change your username"
    },
    {
        id: "About description",
        name: "About description",
        description: "Give a brief description of yourself"
    },
    {
        id: "Avatar",
        name: "Avatar",
        buttonDescription: "Upload an image as your avatar"
    },
    {
        id: "Banner",
        name: "Banner",
        buttonDescription: "Upload a profile background image"
    },
    {
        id: "Social links",
        name: "Social links",
        description: "Add up to five links to display on your profile."
    }
]