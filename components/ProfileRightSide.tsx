"use client"
import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Camera, Ellipsis, Forward, Mail, Plus } from 'lucide-react'
import { useProfile } from "@/app/context/ProfileContext";
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useRouter } from 'nextjs-toploader/app';
import { socialPlatforms } from '@/lib/social-platforms-data';
import Image from 'next/image';
import { toast } from "sonner"

export default function ProfileRightSide() {
    const { profile, isOwner, socialLinks = [] } = useProfile();
    const router = useRouter()
// eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [isCopied, setIsCopied] = useState(false)

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
        <div className='w-80 bg-black mt-4 pb-2 rounded-2xl hidden lg:flex lg:flex-col'>
            <div
                className={`flex justify-end h-28 rounded-t-2xl bg-cover bg-center bg-no-repeat ${!profile.banner_url
                    ? "bg-[#5BAE4A] bg-[linear-gradient(0deg,#000_0%,rgba(0,0,0,0.00)_111.72%)]"
                    : ""
                    }`}
                style={
                    profile.banner_url ? { backgroundImage: `url(${profile.banner_url})` } : !isOwner ? { display: "none" } : {}
                }
            >
                {isOwner && (
                    <Button
                        variant="outline"
                        size="icon"
                        className='self-end m-4 hover:bg-muted rounded-full'
                        onClick={() => router.push('/protected/settings/profile')}
                    >
                        <Camera />
                    </Button>
                )}
            </div>
            <div className='py-2 px-4 gap-2'>
                <div className='space-y-2 border-b pb-2'>
                    <div className={isOwner ? 'space-y-2' : 'flex justify-between'}>
                        <h4 className="scroll-m-20 text-xl tracking-tight">
                            {profile.username}
                        </h4>
                        {
                            isOwner ? (
                                <Button
                                    onClick={copyToClipboard}
                                    className='rounded-full bg-muted hover:bg-reddit-gray'>
                                    <Forward /> Share
                                </Button>
                            ) : (
                                <DropdownMenu>
                                    <DropdownMenuTrigger className='rounded-full p-1 bg-muted hover:bg-reddit-gray'><Ellipsis /></DropdownMenuTrigger>
                                    <DropdownMenuContent className='mr-10'>
                                        <DropdownMenuItem onClick={copyToClipboard}><Forward className='text-foreground' />Share</DropdownMenuItem>
                                        <DropdownMenuItem><Mail className='text-foreground' />Send a Message</DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>

                            )
                        }
                    </div>
                    {
                        profile.description &&
                        <small className="text-sm border-b font-medium text-muted-foreground leading-none">{profile.description}</small>
                    }
                    <div className='grid grid-cols-2 gap-4 mt-3'>
                        <div className='space-y-4'>
                            <div>
                                <p className='leading-7 [&:not(:first-child)]:mt-6'>83</p>
                                <small className="text-sm font-medium text-muted-foreground leading-none">Post karma</small>
                            </div>
                            <div>
                                <p className='leading-7 [&:not(:first-child)]:mt-6'>3</p>
                                <small className="text-sm font-medium text-muted-foreground leading-none">Followers</small>
                            </div>
                        </div>
                        <div className='space-y-4'>
                            <div>
                                <p className='leading-7 [&:not(:first-child)]:mt-6'>876</p>
                                <small className="text-sm font-medium text-muted-foreground leading-none">Comment karma</small>
                            </div>
                            <div>
                                <p className='leading-7 [&:not(:first-child)]:mt-6'>May 21, 2019</p>
                                <small className="text-sm font-medium text-muted-foreground leading-none">Cake day</small>
                            </div>

                        </div>
                    </div>
                </div>
                {
                    isOwner && (
                        <div className='space-y-2 border-b py-2'>
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
                {
                    (socialLinks && socialLinks.length > 0) && (
                        <div className='space-y-2 border-b py-2'>
                            <small className="text-sm font-medium text-muted-foreground leading-none">LINKS</small>
                            <div className='flex flex-wrap gap-2 mt-4'>
                                {
                                    socialLinks.map((link) => {
                                        const platform = socialPlatforms.find(
                                            (sp) => sp.name.toLowerCase() === link.social_name.toLowerCase()
                                        );
                                        const icon = platform?.icon;
                                        return (
                                            <Button key={link.id}
                                                variant="link" className='rounded-full bg-muted hover:bg-reddit-gray text-foreground'
                                                onClick={() => {
                                                    window.open(link.link, '_blank')
                                                }}
                                            >
                                                {icon && (
                                                    <Image
                                                        src={icon}
                                                        alt={link.social_name + " icon"}
                                                        width={20}
                                                        height={20}
                                                    />
                                                )}
                                                {link.username}
                                            </Button>
                                        )
                                    })
                                }
                                {isOwner && (
                                    <Button variant="link" className='rounded-full bg-muted hover:bg-reddit-gray text-foreground'
                                        onClick={() => {
                                            router.push('/protected/settings/profile')
                                        }}
                                    >
                                        <Plus />
                                        Add social link
                                    </Button>
                                )}
                            </div>
                        </div>
                    )
                }
                {isOwner && (!socialLinks || socialLinks.length === 0) && (
                    <div className='space-y-2 border-b py-2'>
                        <small className="text-sm font-medium text-muted-foreground leading-none">LINKS</small>
                        <div className='flex flex-wrap gap-2 mt-4'>
                            <Button variant="link" className='rounded-full bg-muted hover:bg-reddit-gray text-foreground'
                                onClick={() => {
                                    router.push('/protected/settings/profile')
                                }}
                            >
                                <Plus />
                                Add social link
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
