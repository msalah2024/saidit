import React from 'react'
import ProfileHeader from "@/components/ProfileHeader";
import ProfileRightSide from "@/components/ProfileRightSide";
import { fetchProfile, getSocialLinks } from '@/app/actions'
import UserNotFound from "@/components/UserNotFound";
import { ProfileProvider } from "@/app/context/ProfileContext";
import { createClient } from "@/utils/supabase/server";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default async function Layout({ children, params }: any) {
    const supabase = await createClient();
    const awaitedParams = await params
    const username = awaitedParams.username

    const profilePromise = fetchProfile(username);
    const userResult = await supabase.auth.getUser();
    const user = userResult.data.user;

    const socialLinks = (await getSocialLinks(user?.id || "")).data;

    const profile = await profilePromise;

    if (!profile.success) {
        return <UserNotFound />
    }

    return (
        <ProfileProvider profile={profile.data} currentUser={user} socialLinks={socialLinks}>
            <div className="flex gap-x-4 mx-4 sm:mx-8">
                <div className="w-full">
                    <ProfileHeader />
                    {children}
                </div>
                <div className="w-80 hidden lg:flex">
                    <ProfileRightSide />
                </div>
            </div>
        </ProfileProvider>
    );
}
