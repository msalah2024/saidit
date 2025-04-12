import { ReactNode } from "react";
import ProfileHeader from "@/components/ProfileHeader";
import ProfileRightSide from "@/components/ProfileRightSide";
import { fetchProfile } from '@/app/actions'
import UserNotFound from "@/components/UserNotFound";
import { ProfileProvider } from "@/app/context/ProfileContext";

interface LayoutProps {
    children: ReactNode;
    params: { username: string };
}

export default async function Layout({ children, params }: LayoutProps) {
    const { username } = await params
    const profile = await fetchProfile(username)

    if (!profile.success) {
        return <UserNotFound />
    }

    return (
        <ProfileProvider profile={profile.data}>
            <div className="flex">
                <div className="w-[80%]">
                    <ProfileHeader />
                    {children}
                </div>
                <ProfileRightSide />
            </div>
        </ProfileProvider>
    );
}
