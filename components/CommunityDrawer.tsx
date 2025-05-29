import React, { memo, useEffect, useRef, useState, useMemo, useCallback } from 'react'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from './ui/drawer'
import { Button } from './ui/button'
import { ChevronDown, ChevronLeft, ChevronRight, X } from 'lucide-react'
import { motion, AnimatePresence } from "framer-motion";
import UpdateAvatar from './manage-community/update-avatar';
import { useMediaQuery } from '@/hooks/use-media-query';
import UpdateBanner from './manage-community/update-banner';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';

type DrawerStep = {
    id: string;
    title: string;
    component: React.ReactNode;
};

interface CommunityDrawerProps {
    drawerTriggerRef: React.RefObject<HTMLButtonElement | null>
    setGlobalAvatar: (avatar: string | null) => void
    setGlobalBanner: (banner: string | null) => void
    globalAvatar: string | null
    globalBanner: string | null
}

const CommunityDrawer = ({
    drawerTriggerRef,
    setGlobalAvatar,
    globalAvatar,
    setGlobalBanner,
    globalBanner
}: CommunityDrawerProps) => {
    const [isMinimized, setIsMinimized] = useState(false)
    const contentRef = useRef<HTMLDivElement>(null);
    const [contentHeight, setContentHeight] = useState("auto");
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
    const [dismissible, setIsDismissible] = useState(true)
    const isDesktop = useMediaQuery("(min-width: 768px)")

    const [currentStep, setCurrentStep] = useState<string>("main");
    const [history, setHistory] = useState<string[]>(["main"]);
    const [avatarChildrenStep, setAvatarChildrenStep] = useState(0)
    const [avatarOriginalImage, setAvatarOriginalImage] = useState<string | null>(null)
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
    const [bannerChildrenStep, setBannerChildrenStep] = useState(0)
    const [bannerOriginalImage, setBannerOriginalImage] = useState<string | null>(null)
    const [bannerPreview, setBannerPreview] = useState<string | null>(null)
    const [isAvatarGif, setIsAvatarGif] = useState(false)
    const [isBannerGif, setIsBannerGif] = useState(false)
    const [open, setOpen] = useState(false)

    const [showConfirmation, setShowConfirmation] = useState(false)
    const [pendingAction, setPendingAction] = useState<(() => void) | null>(null)

    const steps: DrawerStep[] = useMemo(() => [
        {
            id: "main",
            title: "Community Appearance",
            component: (
                <div className="flex flex-col px-2 py-4 gap-2">
                    <Button
                        variant="ghost"
                        className="justify-between hover:bg-reddit-gray"
                        onClick={() => navigateToStep("avatar")}
                    >
                        Avatar
                        <ChevronRight />
                    </Button>
                    <Button
                        variant="ghost"
                        className="justify-between hover:bg-reddit-gray"
                        onClick={() => navigateToStep("banner")}
                    >
                        Banner
                        <ChevronRight />
                    </Button>
                </div>
            )
        },
        {
            id: "avatar",
            title: "Avatar",
            component: (
                <div className="p-4">
                    <UpdateAvatar
                        globalAvatar={globalAvatar}
                        setGlobalAvatar={setGlobalAvatar}
                        setIsDismissible={setIsDismissible}
                        isDesktop={isDesktop}
                        avatarChildrenStep={avatarChildrenStep}
                        setAvatarChildrenStep={setAvatarChildrenStep}
                        isAvatarGif={isAvatarGif}
                        setIsAvatarGif={setIsAvatarGif}
                        setCurrentStep={setCurrentStep}
                        setHistory={setHistory}
                        originalImage={avatarOriginalImage}
                        setOriginalImage={setAvatarOriginalImage}
                        avatar={avatarPreview}
                        setAvatar={setAvatarPreview}
                    />
                </div>
            )
        },
        {
            id: "banner",
            title: "Banner",
            component: (
                <div className="p-4">
                    <UpdateBanner
                        globalBanner={globalBanner}
                        setGlobalBanner={setGlobalBanner}
                        setIsDismissible={setIsDismissible}
                        isDesktop={isDesktop}
                        bannerChildrenStep={bannerChildrenStep}
                        setBannerChildrenStep={setBannerChildrenStep}
                        isBannerGif={isBannerGif}
                        setIsBannerGif={setIsBannerGif}
                        setCurrentStep={setCurrentStep}
                        setHistory={setHistory}
                        originalImage={bannerOriginalImage}
                        setOriginalImage={setBannerOriginalImage}
                        banner={bannerPreview}
                        setBanner={setBannerPreview}
                    />
                </div>
            )
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    ], [
        globalAvatar, setGlobalAvatar, isDesktop, avatarChildrenStep, setAvatarChildrenStep, isAvatarGif, setIsAvatarGif,
        setCurrentStep, setHistory, globalBanner, setGlobalBanner, bannerChildrenStep, setBannerChildrenStep, isBannerGif, setIsBannerGif
    ]);

    const navigateToStep = useCallback((stepId: string) => {
        setHistory(prev => [...prev, stepId]);
        setCurrentStep(stepId);
    }, []);

    const goBack = useCallback(() => {
        if (history.length > 1) {
            if (avatarChildrenStep > 0) {
                if (avatarChildrenStep === 2 && isAvatarGif) {
                    setAvatarChildrenStep(0)
                } else {
                    setAvatarChildrenStep(Math.max(avatarChildrenStep - 1, 0))
                }
                return
            }
            if (bannerChildrenStep > 0) {
                if (bannerChildrenStep === 2 && isBannerGif) {
                    setBannerChildrenStep(0)
                } else {
                    setBannerChildrenStep(Math.max(bannerChildrenStep - 1, 0))
                }
                return
            }
            const newHistory = [...history];
            newHistory.pop();
            setHistory(newHistory);
            setCurrentStep(newHistory[newHistory.length - 1]);
        }
    }, [history, avatarChildrenStep, isAvatarGif, bannerChildrenStep, isBannerGif]);

    const currentContent = useMemo(
        () => steps.find(step => step.id === currentStep),
        [steps, currentStep]
    );

    const handleMinimize = useCallback(() => setIsMinimized(v => !v), []);

    const resetDrawerState = useCallback(() => {
        setIsDismissible(true)
        setGlobalAvatar(null)
        setGlobalBanner(null)
        setHasUnsavedChanges(false)
        setTimeout(() => {
            setAvatarChildrenStep(0)
            setBannerChildrenStep(0)
            setCurrentStep("main")
            setHistory(["main"])
        }, 300)
    }, [setGlobalAvatar, setGlobalBanner]);

    useEffect(() => {
        if (contentRef.current) {
            setContentHeight(`${contentRef.current.scrollHeight}px`);
        }
    }, [isMinimized, currentContent]);

    useEffect(() => {
        setHasUnsavedChanges(!!globalAvatar || !!globalBanner)
    }, [globalAvatar, globalBanner])

    useEffect(() => {
        if (!hasUnsavedChanges) return
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            e.preventDefault()
            e.returnValue = 'You have unsaved changes. Are you sure you want to leave?'
            return e.returnValue
        }
        window.addEventListener('beforeunload', handleBeforeUnload)
        return () => window.removeEventListener('beforeunload', handleBeforeUnload)
    }, [hasUnsavedChanges])

    const handleDrawerClose = useCallback(() => {
        if (hasUnsavedChanges) {
            setPendingAction(() => () => setOpen(false))
            setShowConfirmation(true)
            return
        }
        setOpen(false)
        resetDrawerState()
    }, [hasUnsavedChanges, resetDrawerState])

    const handleConfirm = () => {
        resetDrawerState()
        setShowConfirmation(false)
        pendingAction?.()
    }

    const handleCancel = () => {
        setShowConfirmation(false)
        setPendingAction(null)
    }

    return (
        <>
            <Drawer modal={false} dismissible={dismissible} open={open} onOpenChange={setOpen} >
                <DrawerTrigger ref={drawerTriggerRef} className='hidden'></DrawerTrigger>
                <DrawerContent className='lg:w-[400px] lg:ml-18 lg:border'
                    onEscapeKeyDown={(e) => {
                        e.preventDefault();
                    }}
                >
                    <motion.div
                        animate={{ height: isMinimized ? 70 : contentHeight }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                        <DrawerHeader className='border-b'>
                            <div className='flex items-center justify-between'>
                                <div className='flex items-center gap-3'>
                                    {currentStep !== "main" && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8"
                                            onClick={goBack}
                                        >
                                            <ChevronLeft className="h-4 w-4" />
                                        </Button>
                                    )}
                                    <DrawerTitle>{currentContent?.title}</DrawerTitle>
                                </div>
                                <div className='gap-2 flex'>
                                    <Button variant="outline" size={'icon'} onClick={handleMinimize}>
                                        <span
                                            className={`transition-transform duration-300 ${isMinimized ? 'rotate-180' : 'rotate-0'}`}
                                        >
                                            <ChevronDown />
                                        </span>
                                    </Button>
                                    <Button variant="outline" size={'icon'} onClick={handleDrawerClose}><X /></Button>
                                </div>
                            </div>
                        </DrawerHeader>
                        <AnimatePresence>
                            {!isMinimized && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    {currentContent?.component}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </DrawerContent>
            </Drawer>
            <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
                <DialogContent
                    onOpenAutoFocus={(e) => e.preventDefault()}
                >
                    <DialogHeader>
                        <DialogTitle>Unsaved Changes</DialogTitle>
                        <DialogDescription>
                            You have unsaved changes. Are you sure you want to leave?
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={handleCancel} className='rounded-full'>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleConfirm} className='rounded-full'>
                            Discard Changes
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}

export default memo(CommunityDrawer)