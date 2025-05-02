import React from 'react'
import ProfileHeader from "@/components/ProfileHeader";
import ProfileRightSide from "@/components/ProfileRightSide";
import { fetchProfile } from '@/app/actions'
import UserNotFound from "@/components/UserNotFound";
import { ProfileProvider } from "@/app/context/ProfileContext";
import { createClient } from "@/utils/supabase/server";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default async function Layout({ children, params }: any) {
    const supabase = await createClient();
    const username = params.username

    const [profile, user] = await Promise.all([
        fetchProfile(username),
        supabase.auth.getUser()
    ])

    if (!profile.success) {
        return <UserNotFound />
    }

    return (
        <ProfileProvider profile={profile.data} currentUser={user.data.user}>
            <div className="flex gap-x-4 mx-8">
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
