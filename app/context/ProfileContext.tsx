"use client";

import { createContext, useContext } from "react";
import { Tables } from "@/database.types";
import { User } from "@supabase/supabase-js";

interface ProfileContextType {
    profile: Tables<'users'>;
    currentUser: User | null;
    isOwner: boolean;
    socialLinks: Tables<'social_links'>[] | undefined
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export function useProfile() {
    const context = useContext(ProfileContext);
    if (context === undefined) {
        throw new Error("useProfile must be used within a ProfileProvider");
    }
    return context;
}

export function ProfileProvider({
    children,
    profile,
    currentUser,
    socialLinks
}: {
    children: React.ReactNode;
    profile: Tables<'users'>;
    currentUser: User | null;
    socialLinks: Tables<'social_links'>[] | undefined
}) {

    const isOwner = currentUser?.id === profile.account_id;

    return (
        <ProfileContext.Provider value={{ profile, currentUser, isOwner, socialLinks }}>
            {children}
        </ProfileContext.Provider>
    );
}
