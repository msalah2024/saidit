"use client";

import { createContext, useContext } from "react";
import { Tables } from "@/database.types";
import { User } from "@supabase/supabase-js";

interface ProfileContextType {
    profile: Tables<'users'>;
    currentUser: User | null;
    isOwner: boolean;
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
    currentUser
}: {
    children: React.ReactNode;
    profile: Tables<'users'>;
    currentUser: User | null;
}) {

    const isOwner = currentUser?.id === profile.account_id;

    return (
        <ProfileContext.Provider value={{ profile, currentUser, isOwner }}>
            {children}
        </ProfileContext.Provider>
    );
}
