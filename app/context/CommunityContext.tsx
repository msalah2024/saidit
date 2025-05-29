"use client";

import { createContext, useContext } from "react";
import { CommunityWithDetails } from "@/complexTypes";

interface ProfileContextType {
    community: CommunityWithDetails;
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
    community: CommunityWithDetails
}) {

    return (
        <ProfileContext.Provider value={{ community }}>
            {children}
        </ProfileContext.Provider>
    );
}
