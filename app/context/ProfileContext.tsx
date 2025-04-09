"use client";

import { createContext, useContext } from "react";
import { Tables } from "@/database.types";

interface ProfileContextType {
    profile: Tables<'users'>;
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
}: {
    children: React.ReactNode;
    profile: Tables<'users'>; // Replace with your profile type
}) {
    return (
        <ProfileContext.Provider value={{ profile }}>
            {children}
        </ProfileContext.Provider>
    );
}
