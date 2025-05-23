"use client";

import { createContext, useContext } from "react";

type Community = {
    id: string;
    creator_id: string;
    community_name: string;
    description: string;
    image_url: string;
    banner_url: string;
    created_at: string;
    updated_at: string;
    type: "public" | "private" | "restricted";
    community_name_lower: string;
    users: {
        id: string;
        email: string;
        gender: string;
        username: string;
        account_id: string;
        avatar_url: string;
        banner_url: string;
        created_at: string;
        updated_at: string;
        description: string;
        display_name: string;
        username_lower: string;
    };
    community_moderators: Array<{
        id: string;
        user_id: string;
        created_at: string;
        updated_at: string;
        community_id: string;
    }>;
    community_memberships: Array<{
        count: number;
    }>;
};


interface ProfileContextType {
    community: Community;
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
    community: Community
}) {

    return (
        <ProfileContext.Provider value={{ community }}>
            {children}
        </ProfileContext.Provider>
    );
}
