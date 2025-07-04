import React, { createContext, useContext, useState, ReactNode } from "react";

type CommentRefreshContextType = {
    refreshVersion: number;
    triggerRefresh: () => void;
};

const CommentRefreshContext = createContext<CommentRefreshContextType | undefined>(undefined);

export function useCommentRefresh() {
    const ctx = useContext(CommentRefreshContext);
    if (!ctx) throw new Error("useCommentRefresh must be used within CommentRefreshProvider");
    return ctx;
}

export function CommentRefreshProvider({ children }: { children: ReactNode }) {
    const [refreshVersion, setRefreshVersion] = useState(0);
    const triggerRefresh = () => setRefreshVersion(v => v + 1);

    return (
        <CommentRefreshContext.Provider value={{ refreshVersion, triggerRefresh }}>
            {children}
        </CommentRefreshContext.Provider>
    );
}