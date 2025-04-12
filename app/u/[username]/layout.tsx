import { ReactNode } from "react";
import ProfileHeader from "@/components/ProfileHeader";
import ProfileRightSide from "@/components/ProfileRightSide";
import { fetchProfile } from '@/app/actions'
import UserNotFound from "@/components/UserNotFound";
import { ProfileProvider } from "@/app/context/ProfileContext";
import { createClient } from "@/utils/supabase/server";

interface LayoutProps {
    children: ReactNode;
    params: { username: string };
}

export default async function Layout({ children, params }: LayoutProps) {
    const supabase = await createClient();
    const { username } = params

    const [profile, user] = await Promise.all([
        fetchProfile(username),
        supabase.auth.getUser()
    ])

    if (!profile.success) {
        return <UserNotFound />
    }

    return (
        <ProfileProvider profile={profile.data} currentUser={user.data.user}>
            <div className="flex justify-between mx-8">
                <div>
                    <ProfileHeader />
                    {children}
                </div>
                <ProfileRightSide />
            </div>
        </ProfileProvider>
    );
}
