import React, { memo, useEffect, useRef, useState } from 'react'
import { Drawer, DrawerClose, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from './ui/drawer'
import { Button } from './ui/button'
import { ChevronDown, ChevronLeft, ChevronRight, X } from 'lucide-react'
import { motion, AnimatePresence } from "framer-motion";
import UpdateAvatar from './manage-community/update-avatar';
import { useMediaQuery } from '@/hooks/use-media-query';

type DrawerStep = {
    id: string;
    title: string;
    component: React.ReactNode;
};

interface CommunityDrawerProps {
    drawerTriggerRef: React.RefObject<HTMLButtonElement | null>
    setGlobalAvatar: (avatar: string | null) => void
    setGlobalBanner: (banner: string) => void
}

const CommunityDrawer = ({ drawerTriggerRef, setGlobalAvatar, setGlobalBanner }: CommunityDrawerProps) => {
    const [isMinimized, setIsMinimized] = useState(false)
    const contentRef = useRef<HTMLDivElement>(null);
    const [contentHeight, setContentHeight] = useState("auto");
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
    const [dismissible, setIsDismissible] = useState(true)
    const isDesktop = useMediaQuery("(min-width: 768px)")

    const [currentStep, setCurrentStep] = useState<string>("main");
    const [history, setHistory] = useState<string[]>(["main"]);
    const [avatarChildrenStep, setAvatarChildrenStep] = useState(0)
    const [isAvatarGif, setIsAvatarGif] = useState(false)

    const steps: DrawerStep[] = [
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
                        setGlobalAvatar={setGlobalAvatar}
                        setIsDismissible={setIsDismissible}
                        isDesktop={isDesktop}
                        avatarChildrenStep={avatarChildrenStep}
                        setAvatarChildrenStep={setAvatarChildrenStep}
                        isAvatarGif={isAvatarGif}
                        setIsAvatarGif={setIsAvatarGif}
                        setCurrentStep={setCurrentStep}
                        setHistory={setHistory}
                    />
                </div>
            )
        },
        {
            id: "banner",
            title: "Banner",
            component: (
                <div className="p-4">
                    <p>Banner upload and customization UI goes here</p>
                </div>
            )
        }
    ];

    const navigateToStep = (stepId: string) => {
        setHistory(prev => [...prev, stepId]);
        setCurrentStep(stepId);
    };

    const goBack = () => {
        if (history.length > 1) {
            if (avatarChildrenStep > 0) {
                if (avatarChildrenStep === 2 && isAvatarGif) {
                    setAvatarChildrenStep(0)
                    return
                }
                else {
                    setAvatarChildrenStep(Math.max(avatarChildrenStep - 1, 0))
                    if (avatarChildrenStep === 1) {
                    }
                    return
                }
            }
            else {
                const newHistory = [...history];
                newHistory.pop();
                setHistory(newHistory);
                setCurrentStep(newHistory[newHistory.length - 1]);
            }
        }
    };

    const currentContent = steps.find(step => step.id === currentStep);

    const handleMinimize = () => {
        if (isMinimized) {
            setIsMinimized(false)
        }
        else {
            setIsMinimized(true)
        }
    }

    useEffect(() => {
        if (contentRef.current) {
            setContentHeight(`${contentRef.current.scrollHeight}px`);
        }
    }, [isMinimized, currentContent]);



    return (
        <Drawer modal={false} dismissible={dismissible}>
            <DrawerTrigger ref={drawerTriggerRef} className='hidden'></DrawerTrigger>
            <DrawerContent className='lg:w-[400px] lg:ml-18 lg:border'>
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
                                <Button variant="outline" size={'icon'} onClick={() => { handleMinimize() }}>
                                    <span
                                        className={`transition-transform duration-300 ${isMinimized ? 'rotate-180' : 'rotate-0'}`}
                                    >
                                        <ChevronDown />
                                    </span>
                                </Button>
                                <DrawerClose asChild>
                                    <Button variant="outline" size={'icon'}><X /></Button>
                                </DrawerClose>
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
                                {!isMinimized && currentContent?.component}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </DrawerContent>
        </Drawer>
    )
}

export default memo(CommunityDrawer)