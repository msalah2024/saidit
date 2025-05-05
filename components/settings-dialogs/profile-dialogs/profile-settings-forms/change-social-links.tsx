import React, { useState } from "react";
import { socialPlatforms } from "@/lib/social-platforms-data";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { User } from "@supabase/supabase-js";
import { Check, Loader2, Search } from "lucide-react";
import { DialogClose } from "@/components/ui/dialog";
import Image from "next/image";
import { SocialPlatform } from "@/lib/social-platforms-data";
import {
    upsertSocialLink,
    deleteSocialLink,
} from "@/app/actions";
import { SocialLinkSchema } from "@/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage,
} from "@/components/ui/form";
import { Tables } from "@/database.types";
import { toast } from "sonner";

interface ChangeSocialLinksProps {
    user: User | null;
    isDesktop: boolean;
    syncedPlatforms: Tables<"social_links">[] | undefined;
    fetchLinks: () => Promise<void>;
}

type SocialPlatformExtended = SocialPlatform & {
    icon?: string;
    urlPrefix?: string;
    placeholder?: string;
    username?: string;
    synced?: boolean
};

export default function ChangeSocialLinks({
    user,
    syncedPlatforms,
    fetchLinks
}: ChangeSocialLinksProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [step, setStep] = useState(0);
    const [selectedPlatform, setSelectedPlatform] = useState<SocialPlatform | null>(null);
    const [originalValue, setOriginalValue] = useState("");

    const form = useForm<z.infer<typeof SocialLinkSchema>>({
        resolver: zodResolver(SocialLinkSchema),
        defaultValues: {
            text: "",
        },
    });

    const handleSocialClick = (platform: SocialPlatform, username: string) => {
        form.setValue("text", username);
        setOriginalValue(username);
        setStep(1);
        setSelectedPlatform(platform);
    };

    const showDeleteButton = originalValue.length > 0

    const normalizedSyncedPlatforms: SocialPlatformExtended[] = (
        syncedPlatforms ?? []
    ).map((platform) => {
        const match = socialPlatforms.find(
            (sp) => sp.name.toLowerCase() === platform.social_name.toLowerCase()
        );
        const urlPrefix = match?.urlPrefix || "";
        return {
            ...platform,
            name: platform.social_name,
            icon: match?.icon,
            urlPrefix,
            placeholder: match?.placeholder,
            synced: true
        };
    });

    const combinedPlatforms: SocialPlatformExtended[] = [
        ...(normalizedSyncedPlatforms ?? []),
        ...socialPlatforms,
    ];

    const filteredPlatforms: SocialPlatformExtended[] =
        combinedPlatforms.filter((platform) =>
            platform.name.toLowerCase().includes(searchQuery.toLowerCase())
        );

    const handleDelete = async () => {
        try {
            setIsDeleting(true);

            if (!selectedPlatform) {
                return;
            }

            const result = await deleteSocialLink(selectedPlatform?.id);

            if (result.success) {
                await fetchLinks?.()
                setStep(0);
            } else {
                toast.error("Error deleting social link");
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsDeleting(false);
        }
    };

    async function onSubmit(data: z.infer<typeof SocialLinkSchema>) {
        const fullUrl = selectedPlatform?.urlPrefix + data.text;
        const username = data.text

        if (data.text === originalValue) {
            setStep(0);
            return
        }

        const doesExit = combinedPlatforms.find((social) => social.username === data.text && social.name === selectedPlatform?.name)
        if (doesExit) {
            form.setError("text", {
                type: "custom",
                message: "This social link already exist",
            })
            return
        }

        try {
            setIsSubmitting(true);

            if (!user || !selectedPlatform) {
                form.setError("text", {
                    type: "custom",
                    message: "An error occurred",
                });
                return;
            }

            const result = await upsertSocialLink(
                selectedPlatform?.name,
                user?.id,
                fullUrl,
                username

            );
            if (result.success) {
                await fetchLinks?.()
                setStep(0);
            } else {
                form.setError("text", {
                    type: "custom",
                    message: result.message,
                });
                return;
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    }

    const renderStep = () => {
        switch (step) {
            case 0:
                return (
                    <div className="flex flex-col">
                        <ScrollArea
                            className="max-h-96 pr-4"
                        >
                            <div className="relative mb-4 m-1">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    type="text"
                                    placeholder="Search"
                                    value={searchQuery}
                                    onChange={(e) =>
                                        setSearchQuery(e.target.value)
                                    }
                                    className="p-6 pl-9"
                                />
                            </div>
                            <div className="flex flex-col">
                                {filteredPlatforms.map((link) => {
                                    return (
                                        <Button
                                            key={link.id}
                                            variant="default"
                                            className="justify-between ml-1 bg-background hover:bg-background 
                                            text-primary-foreground-muted hover:text-primary-foreground py-6"
                                            disabled={(syncedPlatforms?.length || 0) >= 5 && !link.synced}
                                            onClick={() =>
                                                handleSocialClick(
                                                    link,
                                                    link.username ?? ""
                                                )
                                            }
                                        >
                                            <div className="flex items-center gap-2">
                                                {link.icon && (
                                                    <Image
                                                        src={link.icon}
                                                        alt={link.name + " icon"}
                                                        width={20}
                                                        height={20}
                                                    />
                                                )}
                                                {link.name}
                                            </div>
                                            {link.username && (
                                                <span className="flex items-center gap-2">
                                                    {link.username}
                                                    <Check
                                                        className="text-primary"
                                                        strokeWidth={3}
                                                    />
                                                </span>
                                            )}
                                        </Button>
                                    );
                                })}
                            </div>
                        </ScrollArea>
                        <div className="flex gap-4 justify-end mt-8">
                            <DialogClose asChild>
                                <Button type="button" variant="redditGray">
                                    Cancel
                                </Button>
                            </DialogClose>

                            <DialogClose asChild>
                                <Button
                                    className="rounded-full px-6"
                                >
                                    Save
                                </Button>
                            </DialogClose>
                        </div>
                    </div>
                );
            case 1:
                return (
                    <div>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)}>
                                <FormField
                                    control={form.control}
                                    name="text"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <Input
                                                    placeholder={
                                                        selectedPlatform?.placeholder
                                                    }
                                                    {...field}
                                                    type="text"
                                                    className="p-6"
                                                />
                                            </FormControl>
                                            <FormMessage className="ml-2" />
                                        </FormItem>
                                    )}
                                />
                                <div className={`flex ${showDeleteButton ? "justify-between" : "justify-end"} mt-8`}>
                                    {
                                        showDeleteButton &&
                                        <div>
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                disabled={isDeleting}
                                                className="rounded-full bg-[#ce2627] hover:bg-[#ce2627]/80"
                                                onClick={handleDelete}
                                            >
                                                {isDeleting ? (
                                                    <>
                                                        <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                                                        Deleting...
                                                    </>
                                                ) : (
                                                    "Delete link"
                                                )}
                                            </Button>
                                        </div>
                                    }

                                    <div className="flex gap-2">
                                        <Button
                                            type="button"
                                            variant="redditGray"
                                            onClick={() => {
                                                setStep(0)
                                                form.clearErrors()
                                            }}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            type="submit"
                                            disabled={
                                                isSubmitting
                                            }
                                            className="rounded-full px-6"
                                        >
                                            {isSubmitting ? (
                                                <>
                                                    <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                                                    Saving...
                                                </>
                                            ) : (
                                                "Save"
                                            )}
                                        </Button>
                                    </div>
                                </div>

                            </form>
                        </Form>
                    </div>
                );
        }
    };

    return <div className="flex flex-col">{renderStep()}</div>;
}
