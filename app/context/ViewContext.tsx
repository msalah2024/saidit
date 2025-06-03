'use client'

import React, { createContext, useContext, useEffect } from "react";
import { useSearchParams, usePathname } from "next/navigation";
import { useRouter } from 'next/navigation'

type ViewType = "Card" | "Compact";
type ViewContextType = {
    view: ViewType;
    setView: (view: ViewType) => void;
};

const ViewContext = createContext<ViewContextType | undefined>(undefined);

export const ViewProvider = ({ children }: { children: React.ReactNode }) => {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    const shouldManageView =
        pathname === '/' ||
        pathname.startsWith('/s') ||
        pathname.startsWith('/u');

    const viewParam = searchParams.get("view");
    let localView: ViewType | null = null;
    if (typeof window !== "undefined") {
        localView = localStorage.getItem("view") as ViewType | null;
    }
    const view: ViewType =
        viewParam === "Compact" ? "Compact"
            : viewParam === "Card" ? "Card"
                : localView === "Compact" ? "Compact"
                    : "Card";

    useEffect(() => {
        if (shouldManageView && !searchParams.has("view")) {
            const params = new URLSearchParams(searchParams.toString());
            params.set("view", view);
            router.replace(`?${params.toString()}`);
        }
        if (shouldManageView && typeof window !== "undefined") {
            localStorage.setItem("view", view);
        }
    }, [shouldManageView, searchParams, router, view]);

    const setView = (newView: ViewType) => {
        if (!shouldManageView) return;
        if (typeof window !== "undefined") {
            localStorage.setItem("view", newView);
        }
        const params = new URLSearchParams(searchParams.toString());
        params.set("view", newView);
        router.replace(`?${params.toString()}`);
    };

    return (
        <ViewContext.Provider value={{
            view: shouldManageView ? view : "Card",
            setView
        }}>
            {children}
        </ViewContext.Provider>
    );
};

export const useView = () => {
    const context = useContext(ViewContext);
    if (!context) throw new Error("useView must be used within ViewProvider");
    return context;
};