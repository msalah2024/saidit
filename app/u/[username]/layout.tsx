import React from 'react'
import { fetchProfile, getSocialLinksByUserName } from '@/app/actions'
import UserNotFound from "@/components/UserNotFound";
import { ProfileProvider } from "@/app/context/ProfileContext";
import { createClient } from "@/utils/supabase/server";
import ProfileChildLayout from '@/components/ProfileChildLayout';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default async function Layout({ children, params }: any) {
    const supabase = await createClient();
    const awaitedParams = await params
    const username = awaitedParams.username

    const profilePromise = fetchProfile(username);
    const userResult = await supabase.auth.getUser();
    const user = userResult.data.user;

    const profile = await profilePromise;

    if (!profile.success) {
        return <UserNotFound />
    }

    const socialLinks = (await getSocialLinksByUserName(profile.data.username)).data;

    return (
        <ProfileProvider profile={profile.data} currentUser={user} socialLinks={socialLinks}>
            <ProfileChildLayout>
                {children}
            </ProfileChildLayout>
        </ProfileProvider>
    );
}
