"use client"
import { useProfile } from "@/app/context/ProfileContext"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "./ui/button"
import { BadgeCheck, CalendarDays, Camera, ChevronLeft, ChevronRight, Ellipsis, Forward, Mail, MessageCircleMore, Plus, Rows2, Rows3, UserX } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { toast } from "sonner"
import { useRouter } from "nextjs-toploader/app"
import Image from "next/image"
import { socialPlatforms } from "@/lib/social-platforms-data"
import { cn } from "@/lib/utils"
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer"
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { format } from "date-fns"
import { useView } from "@/app/context/ViewContext"
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover"

export default function ProfileHeader() {
    const router = useRouter()
    const { profile, isOwner, socialLinks } = useProfile()
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [isCopied, setIsCopied] = useState(false)
    const [activeTab, setActiveTab] = useState("overview")
    const [showLeftScroll, setShowLeftScroll] = useState(false)
    const [showRightScroll, setShowRightScroll] = useState(false)
    const [open, setOpen] = useState(false)
    const { view, setView } = useView()
    const scrollContainerRef = useRef<HTMLDivElement>(null)

    const createAtFormatted = format(new Date(profile.created_at), 'MMM dd, yyyy');
    const verifiedSinceFormatted = profile.verified_since
        ? format(new Date(profile.verified_since), 'MMM, yyyy')
        : "N/A";

    const tabs = [
        { id: "overview", label: "Overview" },
        { id: "posts", label: "Posts" },
        { id: "comments", label: "Comments" },
        { id: "saved", label: "Saved", ownerOnly: true },
        { id: "hidden", label: "Hidden", ownerOnly: true },
        { id: "upvoted", label: "Upvoted", ownerOnly: true },
        { id: "downvoted", label: "Downvoted", ownerOnly: true },]

    const visibleTabs = tabs.filter((tab) => !tab.ownerOnly || isOwner)

    const checkScroll = () => {
        if (scrollContainerRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current
            setShowLeftScroll(scrollLeft > 0)
            setShowRightScroll(scrollLeft < scrollWidth - clientWidth - 1)
        }
    }

    const scroll = (direction: "left" | "right") => {
        if (scrollContainerRef.current) {
            const scrollAmount = 200
            const currentScroll = scrollContainerRef.current.scrollLeft
            const newScroll = direction === "left" ? currentScroll - scrollAmount : currentScroll + scrollAmount

            scrollContainerRef.current.scrollTo({
                left: newScroll,
                behavior: "smooth",
            })
        }
    }

    useEffect(() => {
        checkScroll()
        window.addEventListener("resize", checkScroll)
        return () => window.removeEventListener("resize", checkScroll)
    }, [isOwner])

    useEffect(() => {
        const scrollContainer = scrollContainerRef.current
        if (scrollContainer) {
            scrollContainer.addEventListener("scroll", checkScroll)
            return () => scrollContainer.removeEventListener("scroll", checkScroll)
        }
    }, [])

    const copyToClipboard = async () => {
        const text = `https://www.saidit.app/u/${profile.username}`
        if (!navigator.clipboard) {
            // Fallback for older browsers
            const textarea = document.createElement('textarea');
            textarea.value = text;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
        } else {
            try {
                await navigator.clipboard.writeText(text);
            } catch (err) {
                console.error('Failed to copy: ', err);
                return;
            }
        }
        setIsCopied(true);
        toast.success("Link copied!")
        setTimeout(() => setIsCopied(false), 2000);
    };

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
                className={`flex lg:flex-row flex-col mx-4 lg:mx-0 lg:items-center lg:gap-4 gap-2 lg:mt-0 ${profile.banner_url || isOwner ? "-mt-10" : "mt-4"}`}
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
                        )
                        }
                    </div>
                    <div className="mt-10 lg:hidden">
                        {isOwner ? (
                            <Button onClick={copyToClipboard} variant="redditGray" className="rounded-full" size="icon">
                                <Forward strokeWidth={2} />
                            </Button>
                        ) : (
                            <div className="flex gap-2">
                                <Button variant="secondary" className="rounded-full" disabled>
                                    Follow
                                </Button>
                                <Button size="icon" variant="redditGray" className="bg-reddit-gray hover:bg-reddit-gray/80" disabled>
                                    <MessageCircleMore />
                                </Button>
                                <Drawer open={open} onOpenChange={setOpen}>
                                    <DrawerTrigger className="bg-reddit-gray hover:bg-reddit-gray/80 
                                    flex justify-center items-center rounded-full size-9">
                                        <Ellipsis />
                                    </DrawerTrigger>
                                    <DrawerContent>
                                        <DrawerHeader className="border-b">
                                            <DrawerTitle className="text-xl mx-2 text-primary-foreground-muted mt-2">Options</DrawerTitle>
                                        </DrawerHeader>
                                        <div className="flex flex-col gap-1 mb-4 py-1 text-primary-foreground-muted">
                                            <div
                                                onClick={() => {
                                                    copyToClipboard()
                                                    setOpen(false)
                                                }}
                                                className='flex items-center px-6 py-3 gap-4 w-full justify-start'>
                                                <Forward strokeWidth={2} />
                                                Share
                                            </div>
                                            <div className='flex items-center px-6 py-3 gap-4 w-full justify-start'>
                                                <Mail /> Send a Message
                                            </div>
                                            <div
                                                className='flex items-center px-6 py-3 gap-4 w-full justify-start'>
                                                <UserX /> Block
                                            </div>

                                        </div>
                                    </DrawerContent>
                                </Drawer>

                            </div>
                        )}
                    </div>
                </div>
                <div className="flex flex-col">
                    <div className="flex gap-2 items-center">
                        <h2 className="scroll-m-20 text-3xl break-all font-semibold tracking-tight first:mt-0 text-primary-foreground-muted">
                            {profile.display_name || profile.username}
                        </h2>
                        {
                            profile.verified &&
                            <Popover>
                                <PopoverTrigger asChild className="hover:bg-muted rounded-sm p-0.5">
                                    <BadgeCheck className="text-background hover:cursor-pointer" fill="#5BAE4A" size={28} />
                                </PopoverTrigger>
                                <PopoverContent asChild className="ml-2 md:ml-26">
                                    <div className="flex flex-col gap-2">
                                        <h4 className="scroll-m-20 text-primary-foreground-muted text-xl font-semibold tracking-tight">
                                            Verified account
                                        </h4>
                                        <div className="flex gap-2">
                                            <div className="flex flex-col gap-2 items-center">
                                                <BadgeCheck className="text-background" fill="#5BAE4A" />
                                                <CalendarDays size={18} className="text-primary-foreground-muted" />
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <p className="text-muted-foreground">
                                                    This account is verified.
                                                </p>
                                                <p className="text-muted-foreground">
                                                    Verified since {verifiedSinceFormatted}.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </PopoverContent>
                            </Popover>
                        }
                    </div>
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
            {
                profile.description &&
                <small className="text-sm mx-4 text-primary-foreground-muted bg-black p-4 
                lg:hidden rounded-2xl font-medium leading-none">{profile.description}</small>
            }

            <Accordion type="single" collapsible className="mx-4 bg-black rounded-2xl px-4 lg:hidden">
                <AccordionItem value="item-1">
                    <AccordionTrigger className="hover:no-underline text-primary-foreground-muted">About</AccordionTrigger>
                    <AccordionContent>
                        <div className='grid grid-cols-2 gap-4'>
                            <div className='space-y-4'>
                                <div>
                                    <p className='leading-7 [&:not(:first-child)]:mt-6'>{profile.post_karma}</p>
                                    <small className="text-sm font-medium text-muted-foreground leading-none">Post karma</small>
                                </div>
                                <div>
                                    <p className='leading-7 [&:not(:first-child)]:mt-6'>0</p>
                                    <small className="text-sm font-medium text-muted-foreground leading-none">Followers</small>
                                </div>
                            </div>
                            <div className='space-y-4'>
                                <div>
                                    <p className='leading-7 [&:not(:first-child)]:mt-6'>0</p>
                                    <small className="text-sm font-medium text-muted-foreground leading-none">Comment karma</small>
                                </div>
                                <div>
                                    <p className='leading-7 [&:not(:first-child)]:mt-6'>{createAtFormatted}</p>
                                    <small className="text-sm font-medium text-muted-foreground leading-none">Cake day</small>
                                </div>

                            </div>
                        </div>
                        {
                            isOwner && (
                                <div className='space-y-2 py-2 border-t mt-4'>
                                    <small className="text-sm font-medium text-muted-foreground leading-none">SETTINGS</small>
                                    <div className='flex gap-2 items-center justify-between mt-4'>
                                        <div className='flex gap-2 items-center'>
                                            <Avatar>
                                                <AvatarImage draggable="false" src={profile.avatar_url || undefined} alt="avatar" className='rounded-full' />
                                                <AvatarFallback>
                                                    {profile.username.slice(0, 2).toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className='flex flex-col gap-1'>
                                                <small className="text-sm font-medium leading-none">Profile</small>
                                                <small className="text-sm font-medium text-muted-foreground leading-none">Customize your profile</small>
                                            </div>
                                        </div>
                                        <Button variant="link" className='rounded-full bg-muted hover:bg-reddit-gray text-foreground'
                                            onClick={() => {
                                                router.push('/protected/settings/profile')
                                            }}
                                        >Update</Button>
                                    </div>
                                </div>
                            )
                        }
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
            <div className="w-full relative">
                {showLeftScroll && (
                    <button
                        onClick={() => scroll("left")}
                        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-muted ml-2 bg-opacity-90 p-1 rounded-full text-primary-foreground-muted
                         hover:text-primary-foreground"
                        aria-label="Scroll left"
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </button>
                )}

                <div
                    ref={scrollContainerRef}
                    className="flex items-center space-x-1 overflow-x-auto scrollbar-hide mx-4 lg:mx-0"
                    onScroll={checkScroll}
                >
                    {visibleTabs.map((tab) => (
                        <Button
                            key={tab.id}
                            variant={'ghost'}
                            onClick={() => setActiveTab(tab.id)}
                            disabled={tab.id !== "overview"}
                            className={cn(
                                "px-4 py-2 text-sm font-medium rounded-full whitespace-nowrap flex-shrink-0",
                                activeTab === tab.id
                                    ? "bg-reddit-gray text-primary-foreground"
                                    : "text-primary-foreground-muted hover:text-primary-foreground",
                            )}
                        >
                            {tab.label}
                        </Button>
                    ))}
                </div>

                {showRightScroll && (
                    <button
                        onClick={() => scroll("right")}
                        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-muted mr-2 bg-opacity-90 p-1 rounded-full
                         text-primary-foreground-muted hover:text-primary-foreground"
                        aria-label="Scroll right"
                    >
                        <ChevronRight className="h-5 w-5" />
                    </button>
                )}
            </div>
            <div className="flex gap-2 mx-4 lg:mx-0">
                <Select defaultValue='New' disabled>
                    <SelectTrigger className="w-32">
                        <SelectValue placeholder="Best" />
                    </SelectTrigger>
                    <SelectContent defaultChecked>
                        <SelectGroup>
                            <SelectLabel>Sort by</SelectLabel>
                            <SelectItem value="Best">Best</SelectItem>
                            <SelectItem value="Hot">Hot</SelectItem>
                            <SelectItem value="New">New</SelectItem>
                            <SelectItem value="Top">Top</SelectItem>
                            <SelectItem value="Rising">Rising</SelectItem>
                        </SelectGroup>
                    </SelectContent>
                </Select>
                <Select value={view} onValueChange={setView}>
                    <SelectTrigger className="w-34">
                        <SelectValue placeholder="Card" />
                    </SelectTrigger>
                    <SelectContent defaultChecked>
                        <SelectGroup>
                            <SelectLabel>View</SelectLabel>
                            <SelectItem value="Card"><Rows2 className='text-primary-foreground' />Card</SelectItem>
                            <SelectItem value="Compact"><Rows3 className='text-primary-foreground' />Compact</SelectItem>
                        </SelectGroup>
                    </SelectContent>
                </Select>
            </div>
        </div>
    )
}
