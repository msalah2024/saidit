"use client"
import React, { useState } from 'react'
import AccountDialog from '@/components/settings-dialogs/account-dialogs/AccountDialog'
import { useGeneralProfile } from '@/app/context/GeneralProfileContext'
import { accountSettingsCategories } from '@/lib/settings-data'
import { Button } from '@/components/ui/button'
import { ChevronRight } from 'lucide-react'
import Image from 'next/image'
import discordLogo from "@/public/assets/images/discordIcon.svg"
import googleLogo from "@/public/assets/images/googleIcon.svg"

export default function Page() {
    const { profile, user } = useGeneralProfile()
    const [open, setOpen] = useState(false)
    const [category, setCategory] = useState(accountSettingsCategories[0])

    const discordIdentity = user?.identities?.some((identity) => identity.provider === "discord")
    const googleIdentity = user?.identities?.some((identity) => identity.provider === "google")
    const socialIdentities = discordIdentity || googleIdentity
    const emailIdentity = user?.identities?.some((identity) => identity.provider === "email")
    const noPassword = !user?.user_metadata.hasPassword
    const hidePasswordButton = socialIdentities && !emailIdentity && noPassword

    const handleOpenSettings = (category: (typeof accountSettingsCategories)[0]) => {
        setCategory(category)
        setOpen(true)
    }

    return (
        <div className='space-y-4'>
            <h3 className="scroll-m-20 text-2xl text-primary-foreground-muted font-semibold tracking-tight">
                General
            </h3>

            <div className="flex flex-col gap-2">
                {accountSettingsCategories.slice(0, 3).map((category) => {
                    if (category.id === "Password" && hidePasswordButton) return null;
                    return (
                        <Button
                            key={category.name}
                            variant="ghost"
                            className="w-full text-primary-foreground-muted py-6 px-0 sm:px-4 justify-between hover:bg-background group"
                            onClick={() => handleOpenSettings(category)}
                        >
                            <div className='flex flex-col items-start'>
                                {category.name}
                                {user?.new_email && category.id === "Email address" && (
                                    <span className="text-sm text-muted-foreground">Pending verification</span>
                                )}
                            </div>
                            <div className='flex gap-2 items-center'>
                                {category === accountSettingsCategories[0] && profile?.email ? (
                                    <span className={`ml-2 text-sm text-muted-foreground ${user?.new_email && `text-red-400`}`}>
                                        <span className="hidden sm:inline">
                                            {profile.email}
                                        </span>
                                        <span className="inline sm:hidden">
                                            {profile.email.length > 20 ? `${profile.email.slice(0, 20)}...` : profile.email}
                                        </span>
                                    </span>
                                ) : (category === accountSettingsCategories[2] && profile?.gender && (
                                    <span className="ml-2 text-sm text-muted-foreground">
                                        {profile.gender.charAt(0).toUpperCase() + profile.gender.slice(1)}
                                    </span>
                                ))}
                                <div className='p-2 rounded-full group-hover:bg-reddit-gray'>
                                    <ChevronRight />
                                </div>
                            </div>
                        </Button>
                    );
                })}
            </div>

            <h3 className="scroll-m-20 text-2xl text-primary-foreground-muted font-semibold tracking-tight">
                Account authorization
            </h3>
            {
                accountSettingsCategories.slice(3, 5).map((category) => (

                    category === accountSettingsCategories[3] ? (
                        <Button
                            key={category.name}
                            variant="ghost"
                            className="w-full text-primary-foreground-muted py-6 px-0 sm:px-4 justify-between hover:bg-background group"
                            onClick={() => handleOpenSettings(category)}
                        >
                            <div className='flex flex-col items-start'>
                                <div className='flex gap-2'>
                                    <Image src={discordLogo} width={16} height={16} alt='discord logo' />
                                    {category.name}
                                </div>
                                <div>
                                    {
                                        !googleIdentity &&
                                        <span className='text-sm hidden sm:block text-muted-foreground'>Connect to log in to Saidit with your Discord account</span>
                                    }
                                </div>
                            </div>
                            {
                                discordIdentity ? (
                                    <div className='border border-input bg-background shadow-xs group-hover:bg-accent group-hover:text-accent-foreground rounded-full px-4 py-2'>
                                        Disconnect
                                    </div>
                                ) : (
                                    <div className='bg-muted text-primary-foreground shadow-xs group-hover:bg-reddit-gray rounded-full px-4 py-2'>
                                        Connect
                                    </div>
                                )
                            }
                        </Button>) : (
                        <Button
                            key={category.name}
                            variant="ghost"
                            className="w-full text-primary-foreground-muted py-6 px-0 sm:px-4 justify-between hover:bg-background group"
                            onClick={() => handleOpenSettings(category)}
                        >
                            <div className='flex flex-col items-start'>
                                <div className='flex gap-2'>
                                    <Image src={googleLogo} width={16} height={16} alt='google logo' />
                                    {category.name}
                                </div>
                                <div>
                                    {
                                        !googleIdentity &&
                                        <span className='text-sm hidden sm:block text-muted-foreground'>Connect to log in to Saidit with your Google account</span>
                                    }
                                </div>
                            </div>
                            {
                                googleIdentity ? (
                                    <div className='border border-input bg-background shadow-xs group-hover:bg-accent group-hover:text-accent-foreground rounded-full px-4 py-2'>
                                        Disconnect
                                    </div>
                                ) : (
                                    <div className='bg-muted text-primary-foreground shadow-xs group-hover:bg-reddit-gray rounded-full px-4 py-2'>
                                        Connect
                                    </div>
                                )
                            }
                        </Button>)
                ))
            }
            <h3 className="scroll-m-20 text-2xl text-primary-foreground-muted font-semibold tracking-tight">
                Advanced
            </h3>
            {
                accountSettingsCategories.slice(5).map((category) => (
                    <Button
                        key={category.name}
                        variant="ghost"
                        className="w-full text-primary-foreground-muted py-6 px-0 sm:px-4 justify-between hover:bg-background group"
                        onClick={() => handleOpenSettings(category)}
                    >
                        {category.name}
                        <div className='p-2 rounded-full group-hover:bg-reddit-gray'>
                            <ChevronRight />
                        </div>
                    </Button>
                ))
            }
            <AccountDialog profile={profile ?? null} user={user} open={open} onOpenChange={setOpen} selectedCategory={category}
                googleIdentity={googleIdentity} discordIdentity={discordIdentity} hidePasswordButton={hidePasswordButton}
            />
        </div>
    )
}
