"use client";

import { createContext, useContext } from "react";
import { Tables } from "@/database.types";

interface ProfileContextType {
    community: Tables<'communities'>;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export function useCommunity() {
    const context = useContext(ProfileContext);
    if (context === undefined) {
        throw new Error("useCommunity must be used within a CommunityProvider");
    }
    return context;
}

export function CommunityProvider({
    children,
    community,
}: {
    children: React.ReactNode;
    community: Tables<'communities'>
}) {

    return (
        <ProfileContext.Provider value={{ community }}>
            {children}
        </ProfileContext.Provider>
    );
}
