"use client"
import { useProfile } from "@/app/context/ProfileContext"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "./ui/button"
import { Camera, Forward, Plus } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { socialPlatforms } from "@/lib/social-platforms-data"

export default function ProfileHeader() {
    const router = useRouter()
    const { profile, isOwner, socialLinks } = useProfile()
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [isCopied, setIsCopied] = useState(false)

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(`https://www.saidit.app/u/${profile.username}`)
            setIsCopied(true)
            toast.success("Link copied!")
            setTimeout(() => setIsCopied(false), 2000) 
        } catch (err) {
            console.error("Failed to copy: ", err)
        }
    }

    return (
        <div className="flex flex-col lg:mt-4 gap-4">
            <div
                className={`relative flex justify-end h-20 lg:hidden bg-cover bg-center bg-no-repeat ${!profile.banner_url ? "bg-[#5BAE4A] bg-[linear-gradient(0deg,#000_0%,rgba(0,0,0,0.00)_111.72%)]" : ""
                    }`}
                style={
                    profile.banner_url ? { backgroundImage: `url(${profile.banner_url})` } : !isOwner ? { display: "none" } : {}
                }
            >
                {isOwner && (
                    <Button
                        variant="redditGray"
                        size="icon"
                        className="mr-4 mb-2 self-end rounded-full"
                        onClick={() => router.push("/protected/settings/profile")}
                    >
                        <Camera />
                    </Button>
                )}
            </div>
            <div
                className={`flex lg:flex-row flex-col mx-4 lg:items-center lg:gap-4 gap-2 lg:mt-0 ${profile.banner_url || isOwner ? "-mt-10" : "mt-4"}`}
            >
                <div className="flex justify-between">
                    <div className="relative">
                        <Avatar className="lg:w-16 lg:h-16 lg:outline-none w-20 h-20 outline-3 outline-border">
                            <AvatarImage draggable={false} src={profile.avatar_url || undefined} className="rounded-full" />
                            <AvatarFallback>{profile.username.slice(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        {isOwner && (
                            <Button
                                variant="redditGray"
                                size="icon"
                                className="absolute -right-3 -bottom-1 lg:hidden p-1"
                                onClick={() => router.push("/protected/settings/profile")}
                            >
                                <Camera />
                            </Button>
                        )}
                    </div>
                    <div className="mt-10 lg:hidden">
                        {isOwner ? (
                            <Button onClick={copyToClipboard} variant="redditGray" className="rounded-full" size="icon">
                                <Forward strokeWidth={2} />
                            </Button>
                        ) : (
                            <div></div>
                        )}
                    </div>
                </div>
                <div className="flex flex-col">
                    <h2 className="scroll-m-20 text-3xl break-all font-semibold tracking-tight first:mt-0 text-primary-foreground-muted">
                        {profile.display_name || profile.username}
                    </h2>
                    <p className="text-muted-foreground">u/{profile.username}</p>
                </div>
            </div>

            {socialLinks && socialLinks.length > 0 && (
                <div className="flex flex-wrap gap-2 mx-4 lg:hidden">
                    {socialLinks.map((link) => {
                        const platform = socialPlatforms.find((sp) => sp.name.toLowerCase() === link.social_name.toLowerCase())
                        const icon = platform?.icon
                        return (
                            <Button
                                key={link.id}
                                variant="link"
                                className="rounded-full bg-muted hover:bg-reddit-gray text-foreground"
                                onClick={() => {
                                    window.open(link.link, "_blank")
                                }}
                            >
                                {icon && (
                                    <Image src={icon || "/placeholder.svg"} alt={link.social_name + " icon"} width={20} height={20} />
                                )}
                                {link.username}
                            </Button>
                        )
                    })}
                    {isOwner && (
                        <Button
                            variant="link"
                            className="rounded-full bg-muted hover:bg-reddit-gray text-foreground"
                            onClick={() => {
                                router.push("/protected/settings/profile")
                            }}
                        >
                            <Plus />
                            Add social link
                        </Button>
                    )}
                </div>
            )}
            {isOwner && (!socialLinks || socialLinks.length === 0) && (
                <Button
                    variant="link"
                    className="rounded-full w-fit mx-4 lg:hidden bg-muted hover:bg-reddit-gray text-foreground"
                    onClick={() => {
                        router.push("/protected/settings/profile")
                    }}
                >
                    <Plus />
                    Add social link
                </Button>
            )}

            <div className="my-2 hidden lg:block">
                <Tabs defaultValue="overview">
                    <TabsList className="h-fit bg-background gap-4 flex-wrap">
                        <TabsTrigger
                            className="px-3 py-2 text-primary-foreground-muted rounded-full data-[state=active]:bg-reddit-gray data-[state=active]:text-primary-foreground hover:underline hover:text-primary-foreground"
                            value="overview"
                        >
                            Overview
                        </TabsTrigger>
                        <TabsTrigger
                            className="px-3 py-2 text-primary-foreground-muted rounded-full data-[state=active]:bg-reddit-gray data-[state=active]:text-primary-foreground hover:underline hover:text-primary-foreground"
                            value="posts"
                        >
                            Posts
                        </TabsTrigger>
                        <TabsTrigger
                            className="px-3 py-2 text-primary-foreground-muted rounded-full data-[state=active]:bg-reddit-gray data-[state=active]:text-primary-foreground hover:underline hover:text-primary-foreground"
                            value="comments"
                        >
                            Comments
                        </TabsTrigger>
                        {isOwner && (
                            <>
                                <TabsTrigger
                                    className="px-3 py-2 text-primary-foreground-muted rounded-full data-[state=active]:bg-reddit-gray data-[state=active]:text-primary-foreground hover:underline hover:text-primary-foreground"
                                    value="saved"
                                >
                                    Saved
                                </TabsTrigger>
                                <TabsTrigger
                                    className="px-3 py-2 text-primary-foreground-muted rounded-full data-[state=active]:bg-reddit-gray data-[state=active]:text-primary-foreground hover:underline hover:text-primary-foreground"
                                    value="hidden"
                                >
                                    Hidden
                                </TabsTrigger>
                                <TabsTrigger
                                    className="px-3 py-2 text-primary-foreground-muted rounded-full data-[state=active]:bg-reddit-gray data-[state=active]:text-primary-foreground hover:underline hover:text-primary-foreground"
                                    value="upvoted"
                                >
                                    Upvoted
                                </TabsTrigger>
                                <TabsTrigger
                                    className="px-3 py-2 text-primary-foreground-muted rounded-full data-[state=active]:bg-reddit-gray data-[state=active]:text-primary-foreground hover:underline hover:text-primary-foreground"
                                    value="downvoted"
                                >
                                    Downvoted
                                </TabsTrigger>
                            </>
                        )}
                    </TabsList>
                </Tabs>
            </div>

            <div className="lg:hidden mx-4 flex my-2">
                <Select>
                    <SelectTrigger className="w-full p-6 data-[placeholder]:text-foreground">
                        <SelectValue placeholder="Overview" defaultValue="overview" defaultChecked />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="overview" className="p-2">
                            Overview
                        </SelectItem>
                        <SelectItem value="posts" className="p-2">
                            Posts
                        </SelectItem>
                        <SelectItem value="comments" className="p-2">
                            Comments
                        </SelectItem>
                        {isOwner && (
                            <>
                                <SelectItem value="saved" className="p-2">
                                    Saved
                                </SelectItem>
                                <SelectItem value="hidden" className="p-2">
                                    Hidden
                                </SelectItem>
                                <SelectItem value="upvoted" className="p-2">
                                    Upvoted
                                </SelectItem>
                                <SelectItem value="downvoted" className="p-2">
                                    Downvoted
                                </SelectItem>
                            </>
                        )}
                    </SelectContent>
                </Select>
            </div>
        </div>
    )
}
