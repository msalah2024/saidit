/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"
import React, { useState, memo, useCallback, useEffect } from 'react'
import { ScrollArea } from './ui/scroll-area'
import { DialogClose, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog'
import {
    Card,
    CardContent,
} from "@/components/ui/card"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { CreateCommunitySchema } from '@/schema'
import { Textarea } from './ui/textarea'
import { RadioGroup, RadioGroupItem } from './ui/radio-group'
import { Globe, Users, Lock, ArrowLeft, Loader2, AlertCircle, Check } from 'lucide-react'
import TopicSelector from './topic-selector'
import ChangeBanner from './manage-community/change-banner'
import { useMediaQuery } from '@/hooks/use-media-query'
import CreateAvatar from './manage-community/create-avatar'
import CommunityRules from './CommunityRules'
import CommunityPreview from './CommunityPreview'
import { addCommunityBannerAndAvatar, createCommunity } from '@/app/actions'
import { toast } from "sonner"
import { createClient } from '@/utils/supabase/client'
import { debounce } from 'lodash'
import { useRouter } from 'nextjs-toploader/app'
import { User } from '@supabase/supabase-js'

type SidebarDialogContent = {
    title: string,
    description: string
}

interface CreateCommunityProps {
    dialogContent: SidebarDialogContent | undefined
    setOpen: (open: boolean) => void
    onUnsavedChanges: (unsaved: boolean) => void
    user: User | null
}

const CommunityNameField = memo(({ form, available, setAvailable }: { form: any, available: boolean | null, setAvailable: (available: boolean | null) => void }) => {
    const [checking, setChecking] = useState(false)
    const supabase = createClient()

    const checkName = debounce(async (name: string) => {
        if (name.length < 3) return
        if (!name) {
            setAvailable(null)
            setChecking(false)
            return
        }
        setChecking(true)
        const { data, error } = await supabase
            .from('communities')
            .select('community_name')
            .eq('community_name_lower', name.toLowerCase())
            .maybeSingle()
        if (error) {
            console.error(error)
        }
        setAvailable(!data)
        setChecking(false)

    }, 500)

    useEffect(() => {
        const subscription = form.watch((value: any, { name: changedField }: any) => {
            if (changedField === 'name') {
                setAvailable(null)
                checkName(value.name)
            }
        })

        return () => {
            subscription.unsubscribe()
            checkName.cancel()
        }
    }, [form, checkName, setAvailable])

    return (
        < Card >
            <CardContent>
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Community name</FormLabel>
                            <FormControl className='mt-2'>
                                <div className='flex gap-3 items-center'>
                                    <p className='text-muted-foreground'>s/</p>
                                    <div className='relative'>
                                        <Input placeholder="Community_name" type='text'
                                            aria-invalid={!!form.formState.errors.name || available === false} {...field}
                                            className={`p-6 max-w-xs pr-10`} />
                                        {
                                            checking &&
                                            <Loader2 className="mr-2 h-5 w-5 animate-spin absolute right-1 top-4" />
                                        }
                                        {available && !checking && form.watch('name').trim(0) !== "" && !form.formState.errors.name ? (
                                            <div className="mr-2 text-primary absolute right-1 top-4 h-5 w-5">
                                                <Check />
                                            </div>
                                        ) : available === false && !checking || !checking && form.formState.errors.name ? (
                                            <div className="text-destructive">
                                                <AlertCircle className=" mr-2 h-5 w-5 absolute right-1 top-4" />
                                            </div>
                                        ) : null}
                                    </div>

                                </div>
                            </FormControl>
                            {available === false && (
                                <p className="text-sm ml-8 font-medium text-red-500">This community name is already taken</p>
                            )}
                            <FormDescription>
                                Community names including capitalization cannot be changed.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </CardContent>
        </Card >
    )

});
CommunityNameField.displayName = "CommunityNameField";

const CommunityDescriptionField = memo(({ form }: { form: any }) => (
    <Card>
        <CardContent>
            <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Community description</FormLabel>
                        <FormControl className='mt-2'>
                            <Textarea
                                placeholder="Tell potential members what your community is about"
                                className="resize-none min-h-24"
                                {...field}
                            />
                        </FormControl>
                        <FormDescription>
                            This is how new members come to understand your community
                        </FormDescription>
                        <FormMessage />
                    </FormItem>
                )}
            />
        </CardContent>
    </Card>
));
CommunityDescriptionField.displayName = "CommunityDescriptionField";

const CommunityAppearanceField = memo(({ isDesktop, setGlobalAvatar, setGlobalBanner }: { isDesktop: boolean, setGlobalAvatar: any, setGlobalBanner: any }) => (
    <Card>
        <CardContent>
            <h3 className="text-sm">Community appearance</h3>
            <p className="text-sm mt-1 text-muted-foreground">Customize how your community looks to members</p>
            <div className='grid md:grid-cols-2 grid-rows-1 gap-4 mt-4'>
                <CreateAvatar isDesktop={isDesktop} setGlobalAvatar={setGlobalAvatar} />
                <ChangeBanner isDesktop={isDesktop} setGlobalBanner={setGlobalBanner} />
            </div>
        </CardContent>
    </Card>
));
CommunityAppearanceField.displayName = "CommunityAppearanceField";

const CommunityTypeField = memo(({ form }: { form: any }) => (
    <Card>
        <CardContent>
            <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Community type</FormLabel>
                        <FormControl className='mt-2'>
                            <RadioGroup
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                className="flex flex-col space-y-1"
                            >
                                <FormItem className="flex items-start space-x-1 space-y-0 rounded-md border">
                                    <FormLabel className="font-medium w-full flex flex-col items-start gap-1 cursor-pointer p-4">
                                        <div className="flex items-center gap-2">
                                            <FormControl>
                                                <RadioGroupItem value="public" />
                                            </FormControl>
                                            <div className='flex gap-2'>
                                                <Globe className="h-4 w-4 text-muted-foreground" />
                                                Public
                                            </div>
                                        </div>
                                        <FormDescription className='ml-6'>Anyone can view, post, and comment to this community</FormDescription>
                                    </FormLabel>
                                </FormItem>
                                <FormItem className="flex items-start space-x-1 space-y-0 rounded-md border">
                                    <FormLabel className="font-medium w-full flex flex-col items-start gap-1 cursor-pointer p-4">
                                        <div className="flex items-center gap-2">
                                            <FormControl>
                                                <RadioGroupItem value="restricted" />
                                            </FormControl>
                                            <div className="flex gap-2">
                                                <Users className="h-4 w-4 text-muted-foreground" />
                                                Restricted
                                            </div>
                                        </div>
                                        <FormDescription className="ml-6">
                                            Anyone can view this community, but only approved users can post
                                        </FormDescription>
                                    </FormLabel>
                                </FormItem>
                                <FormItem className="flex items-start space-x-1 space-y-0 rounded-md border">
                                    <FormLabel className="font-medium w-full flex flex-col items-start gap-1 cursor-pointer p-4">
                                        <div className="flex items-center gap-2">
                                            <FormControl>
                                                <RadioGroupItem value="private" />
                                            </FormControl>
                                            <div className="flex gap-2">
                                                <Lock className="h-4 w-4 text-muted-foreground" />
                                                Private
                                            </div>
                                        </div>
                                        <FormDescription className="ml-6">
                                            Only approved users can view and submit to this community
                                        </FormDescription>
                                    </FormLabel>
                                </FormItem>
                            </RadioGroup>
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
        </CardContent>
    </Card>
));
CommunityTypeField.displayName = "CommunityTypeField";

const CommunityTopicsField = memo(({ form }: { form: any }) => {
    const handleTopicsChange = useCallback(
        (topics: string[]) => {
            form.setValue('topics', topics);
        },
        [form]
    );

    return (
        <Card>
            <CardContent>
                <FormField
                    control={form.control}
                    name="topics"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Add topics</FormLabel>
                            <p className='text-sm text-muted-foreground'>
                                Add up to 3 topics to help interested saiditors find your community.
                            </p>
                            <FormControl className='mt-2'>
                                <TopicSelector
                                    selectedTopics={field.value}
                                    onChange={handleTopicsChange}
                                    maxTopics={3}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </CardContent>
        </Card>
    );
});
CommunityTopicsField.displayName = "CommunityTopicsField";

export default function CreateCommunity({ dialogContent, setOpen, onUnsavedChanges, user }: CreateCommunityProps) {
    const router = useRouter()
    const supabase = createClient()
    const isDesktop = useMediaQuery("(min-width: 768px)")

    const [globalBanner, setGlobalBanner] = useState<string | null>(null)
    const [globalAvatar, setGlobalAvatar] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const [available, setAvailable] = useState<boolean | null>(null)

    const form = useForm<z.infer<typeof CreateCommunitySchema>>({
        resolver: zodResolver(CreateCommunitySchema),
        defaultValues: {
            name: "",
            description: "",
            type: "public",
            topics: []
        },
        mode: 'onChange'
    })

    useEffect(() => {
        const defaultValues = {
            name: "",
            description: "",
            type: "public",
            topics: []
        };

        const subscription = form.watch((value, { type }) => {
            if (type === "change") {
                const isDifferent = JSON.stringify(value) !== JSON.stringify(defaultValues);
                onUnsavedChanges(isDifferent);
            }
        });

        if (globalBanner || globalAvatar) {
            onUnsavedChanges(true);
        }

        return () => subscription.unsubscribe();
    }, [form, globalAvatar, globalBanner, onUnsavedChanges]);



    async function onSubmit(values: z.infer<typeof CreateCommunitySchema>) {

        try {
            setIsSubmitting(true)
            if (!user) { return }
            const result = await createCommunity(user.id, values)

            if (result?.success) {

                let avatarUrl
                let bannerUrl

                if (globalAvatar) {
                    const AvatarFileType = globalAvatar.split(";")[0].split("/")[1]
                    const AvatarFileName = `${user?.id}/community_avatar/${result.data.id}/${Date.now()}.${AvatarFileType}`

                    const AvatarBase64Data = globalAvatar.split(",")[1]
                    const AvatarBinaryData = Buffer.from(AvatarBase64Data, "base64")

                    const { error } = await supabase
                        .storage
                        .from('saidit')
                        .update(AvatarFileName, AvatarBinaryData, {
                            contentType: `image/${AvatarFileType}`,
                            upsert: true
                        })

                    if (error) {
                        console.error("Community avatar upload error", error.message)
                        toast.error(error.message)
                        return
                    }
                    else {
                        ({ data: avatarUrl } = supabase.storage.from('saidit').getPublicUrl(AvatarFileName))
                    }
                }

                if (globalBanner) {
                    const BannerFileType = globalBanner.split(";")[0].split("/")[1]
                    const BannerFileName = `${user?.id}/community_banner/${result.data.id}/${Date.now()}.${BannerFileType}`

                    const BannerBase64Data = globalBanner.split(",")[1]
                    const BannerBinaryData = Buffer.from(BannerBase64Data, "base64")

                    const { error } = await supabase
                        .storage
                        .from('saidit')
                        .update(BannerFileName, BannerBinaryData, {
                            contentType: `image/${BannerFileType}`,
                            upsert: true
                        })

                    if (error) {
                        console.error("Community banner upload error", error.message)
                        toast.error(error.message)
                        return
                    }
                    else {
                        ({ data: bannerUrl } = supabase.storage.from('saidit').getPublicUrl(BannerFileName))
                    }
                }

                const addAvatarAndBanner = await addCommunityBannerAndAvatar(result.data.id, avatarUrl?.publicUrl, bannerUrl?.publicUrl)

                if (addAvatarAndBanner.success) {
                    setOpen(false)
                    toast.success("Community created successfully")
                    router.push(`/s/${result.data.community_name}`)

                }
                else {
                    toast.error("An error occurred trying to upload your images")
                }
            }

            else {
                toast.error("An error occurred trying to create your community")
                return
            }

        } catch (error) {
            console.error(error)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="flex flex-1 my-1 md:my-0">
            <ScrollArea className="flex-1 relative">
                <DialogClose asChild>
                    <Button variant={'redditGray'} size='icon' className='rounded-sm m-5 mb-0 md:mb-2 bg-reddit-gray hover:bg-reddit-gray/90'>
                        <ArrowLeft />
                    </Button>
                </DialogClose>
                <div className='flex justify-center'>
                    <div className="p-6 grid gap-8 md:grid-cols-3 max-w-6xl">
                        <div className="md:col-span-2 justify-self-center flex flex-col gap-4 w-full max-w-2xl">
                            <DialogHeader className='mb-2'>
                                <DialogTitle className='text-3xl font-bold tracking-tight'>{dialogContent?.title}</DialogTitle>
                                <DialogDescription className='text-muted-foreground'>
                                    {dialogContent?.description}
                                </DialogDescription>
                            </DialogHeader >
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                                    <CommunityNameField form={form} available={available} setAvailable={setAvailable} />
                                    <CommunityDescriptionField form={form} />
                                    <CommunityAppearanceField isDesktop={isDesktop} setGlobalAvatar={setGlobalAvatar} setGlobalBanner={setGlobalBanner} />
                                    <CommunityTypeField form={form} />
                                    <CommunityTopicsField form={form} />
                                    <div className='md:hidden'>
                                        <CommunityPreview name={form.watch('name')} description={form.watch('description')}
                                            type={form.watch('type')} topics={form.watch('topics')}
                                            globalAvatar={globalAvatar}
                                            globalBanner={globalBanner}
                                        />
                                    </div>
                                    {
                                        isDesktop ?
                                            <div className='flex gap-2 justify-end'>
                                                <DialogClose asChild>
                                                    <Button type="button" variant="redditGray">
                                                        Cancel
                                                    </Button>
                                                </DialogClose>
                                                <Button type="submit" disabled={isSubmitting || available === false}>
                                                    {isSubmitting ?
                                                        <>
                                                            <Loader2 className="mr-1 h-4 w-4 animate-spin" />Creating community...
                                                        </>
                                                        :
                                                        <>
                                                            Create a community
                                                        </>
                                                    }
                                                </Button>
                                            </div> :
                                            <div className='flex flex-col gap-3 justify-end'>
                                                <Button type="submit" disabled={isSubmitting || available === false} className='p-6'>
                                                    {isSubmitting ?
                                                        <>
                                                            <Loader2 className="mr-1 h-4 w-4 animate-spin" />Creating community...
                                                        </>
                                                        :
                                                        <>
                                                            Create a community
                                                        </>
                                                    }
                                                </Button>
                                                <DialogClose asChild>
                                                    <Button type="button" variant="redditGray" className='p-6'>
                                                        Cancel
                                                    </Button>
                                                </DialogClose>
                                            </div>
                                    }
                                </form>
                            </Form>
                        </div >
                        <div className='sticky flex-col top-25 h-fit hidden md:flex gap-8'>
                            <CommunityRules />
                            <CommunityPreview name={form.watch('name')} description={form.watch('description')}
                                type={form.watch('type')} topics={form.watch('topics')}
                                globalAvatar={globalAvatar}
                                globalBanner={globalBanner}
                            />
                        </div>
                    </div>
                </div>
            </ScrollArea>
        </div>
    )
}
