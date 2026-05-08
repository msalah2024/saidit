"use client"

import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { PostProvider } from "@/app/context/PostContext";
import { CommunityProvider } from "@/app/context/CommunityContext";
import { CommentRefreshProvider } from "@/app/context/CommentRefreshContext";
import PostHeader from "@/components/PostHeader";
import CommentsPage from "@/app/s/[name]/comments/[slug]/page";
import { PostsWithComments, CommunityWithDetails } from "@/complexTypes";
import { useSidebar } from "@/components/ui/sidebar";
import PostBackButton from "@/components/PostBackButton";
import CommunityRightSide from "@/components/CommunityRightSide";

interface PostModalProps {
    post: PostsWithComments;
    community: CommunityWithDetails;
}

export default function PostModal({ post, community }: PostModalProps) {
    const router = useRouter();
    const pathname = usePathname();
    const { open, isMobile } = useSidebar();

    const isActive = pathname.includes("/comments/");
    const leftOffset = !isMobile && open ? "16rem" : "0px";

    const handleClose = () => router.back();

    useEffect(() => {
        if (!isActive) return;
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") handleClose();
        };
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isActive]);

    useEffect(() => {
        if (!isActive) return;
        document.body.style.overflow = "hidden";
        return () => { document.body.style.overflow = ""; };
    }, [isActive]);

    if (!isActive) return null;

    return (
        <div
            className="fixed top-14 bottom-0 right-0 z-50 bg-background overflow-y-auto custom-scrollbar"
            style={{ left: leftOffset }}
        >
            <div className="lg:mx-8 flex justify-center">
                <div className="w-full max-w-6xl">
                    <CommunityProvider community={community}>
                        <PostProvider post={post}>
                            <div className="flex gap-4">
                                <div className="flex-1 mt-4 mx-4 min-w-0">
                                    <div className="flex gap-4">
                                        <div className="hidden lg:flex">
                                            <PostBackButton />
                                        </div>
                                        <div className="flex flex-col gap-4 w-full min-w-0">
                                            <PostHeader />
                                            <CommentRefreshProvider>
                                                <CommentsPage />
                                            </CommentRefreshProvider>
                                        </div>
                                    </div>
                                </div>
                                <div className="min-w-80 w-80 hidden lg:flex">
                                    <CommunityRightSide />
                                </div>
                            </div>
                        </PostProvider>
                    </CommunityProvider>
                </div>
            </div>
        </div>
    );
}
