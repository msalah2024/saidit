"use client"
import React, { memo, useCallback, useEffect, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, Check, CloudUpload, Loader2, ZoomIn } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Slider } from "@/components/ui/slider"
import Cropper from "react-easy-crop"
import type { Area, Point } from "react-easy-crop"
import { toast } from "sonner"
import { useCommunity } from '@/app/context/CommunityContext'
import { useGeneralProfile } from '@/app/context/GeneralProfileContext'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

interface UpdateBannerProps {
    setGlobalBanner: (banner: string | null) => void
    setIsDismissible: (dismissible: boolean) => void
    isDesktop: boolean
    bannerChildrenStep: number
    setBannerChildrenStep: (step: number) => void
    isBannerGif: boolean
    setIsBannerGif: (gif: boolean) => void
    setCurrentStep: (step: string) => void
    setHistory: (history: string[]) => void
    globalBanner: string | null
    originalImage: string | null
    setOriginalImage: (img: string | null) => void
    banner: string | null
    setBanner: (img: string | null) => void
}

const UpdateBanner = ({
    setGlobalBanner, setIsDismissible, isDesktop, bannerChildrenStep,
    setBannerChildrenStep, isBannerGif, setIsBannerGif, setCurrentStep, setHistory,
    originalImage, setOriginalImage, banner, setBanner
}: UpdateBannerProps) => {

    const supabase = createClient()
    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isDragging, setIsDragging] = useState(false)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [dragCounter, setDragCounter] = useState(0)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [isCropperOpen, setIsCropperOpen] = useState(false)
    const [crop, setCrop] = useState<Point>({ x: 0, y: 0 })
    const [zoom, setZoom] = useState(1)
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { community } = useCommunity()
    const { user } = useGeneralProfile()

    const totalSteps = 3;
    const stepArray = Array.from({ length: totalSteps }, (_, i) => i);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            if (!validateFileType(file)) {
                toast.error("Invalid file type", {
                    description: "Only JPEG, PNG, webp, or GIF files are allowed."
                })
                return
            }

            const isGifFile = file.type === "image/gif"
            setIsBannerGif(isGifFile)

            const reader = new FileReader()
            reader.onload = (e) => {
                const imageDataUrl = e.target?.result as string
                setOriginalImage(imageDataUrl)

                if (isGifFile) {
                    setBanner(imageDataUrl)
                    setGlobalBanner(imageDataUrl)
                    setBannerChildrenStep(2)
                } else {
                    setBannerChildrenStep(1)
                }
            }
            reader.readAsDataURL(file)
        }
    }

    useEffect(() => {
        if (bannerChildrenStep === 1) {
            setIsDismissible(false)
        }
        else {
            setIsDismissible(true)
        }
    }, [bannerChildrenStep, setIsDismissible])

    useEffect(() => {
        if (bannerChildrenStep === 0) {
            setGlobalBanner(null)
        }
    }, [bannerChildrenStep, setGlobalBanner])

    const triggerFileInput = () => {
        fileInputRef.current?.click()
    }

    const handleDragEnter = (e: React.DragEvent) => {
        e.preventDefault()
        setDragCounter(prev => prev + 1)
        setIsDragging(true)
    }

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
    }

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault()
        setDragCounter(prev => {
            const newCount = prev - 1
            if (newCount <= 0) {
                setIsDragging(false)
                return 0
            }
            return newCount
        })
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)

        const file = e.dataTransfer.files?.[0]
        if (file) {
            if (!validateFileType(file)) {
                toast.error("Invalid file type", {
                    description: "Only JPEG, PNG, or GIF files are allowed."
                })
                return
            }

            const isGifFile = file.type === "image/gif"
            setIsBannerGif(isGifFile)

            const reader = new FileReader()
            reader.onload = (e) => {
                const imageDataUrl = e.target?.result as string
                setOriginalImage(imageDataUrl)

                if (isGifFile) {
                    setBanner(imageDataUrl)
                    setGlobalBanner(imageDataUrl)
                    setBannerChildrenStep(2)
                } else {
                    setBannerChildrenStep(1)
                }
            }
            reader.readAsDataURL(file)
        }
    }

    const goToNextStep = () => {
        setBannerChildrenStep(Math.min(bannerChildrenStep + 1, 2))
    }

    const goToPreviousStep = () => {
        setBannerChildrenStep(Math.max(bannerChildrenStep - 1, 0))
    }

    const onCropComplete = useCallback((croppedArea: Area, croppedAreaPixels: Area) => {
        setCroppedAreaPixels(croppedAreaPixels)
    }, [])

    const createCroppedImage = useCallback(async () => {
        if (!originalImage || !croppedAreaPixels) return
        try {
            const croppedImage = await getCroppedImg(originalImage, croppedAreaPixels)
            setBanner(croppedImage)
            setGlobalBanner(croppedImage)
            goToNextStep()
        } catch (e) {
            console.error(e)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [originalImage, croppedAreaPixels, setGlobalBanner])

    const handleFileUpload = async () => {
        if (!banner) { return }

        try {
            setIsSubmitting(true)
            setGlobalBanner(banner)

            if (!community) { return }

            const fileType = banner.split(";")[0].split("/")[1]
            const fileName = `${user?.id}/community_banner/${community.id}/${Date.now()}.${fileType}`

            const base64Data = banner.split(",")[1]
            const binaryData = Buffer.from(base64Data, "base64")

            const { error } = await supabase
                .storage
                .from('saidit')
                .update(fileName, binaryData, {
                    contentType: `image/${fileType}`,
                    upsert: true
                })

            if (error) {
                console.error("update banner error", error.message)
                toast.error(error.message)
                return
            }

            else {
                const oldBanner = community?.image_url ?? ""
                const clippedBannerUrl = oldBanner.split('saidit/')[1];

                const { error: removeError } = await supabase
                    .storage
                    .from('saidit')
                    .remove([clippedBannerUrl])

                if (removeError) {
                    console.error("Update banner error", removeError.message)
                    toast.error(removeError.message)
                    return
                }

                else {
                    const { data } = supabase.storage.from('saidit').getPublicUrl(fileName)
                    const { error } = await supabase.from('communities').update({
                        banner_url: data.publicUrl
                    }).eq('id', community.id)

                    if (error) {
                        console.error("Update banner error", error.message)
                        toast.error(error.message)
                    }
                    else {
                        router.refresh()
                        toast.success("Banner uploaded successfully")
                        setBannerChildrenStep(0)
                        setGlobalBanner(null)
                        setCurrentStep("main")
                        setHistory(["main"])
                    }
                }
            }
        } catch (error) {
            console.error(error)
        } finally {
            setIsSubmitting(false)
        }
    }

    const renderStepContent = () => {
        switch (bannerChildrenStep) {
            case 0:
                return (
                    <div>
                        <div className={`flex flex-col items-center w-full mt-2 rounded-lg border-2 border-dashed p-6 
                           ${isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/20"}`}
                            onDragEnter={handleDragEnter}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                        >
                            <CloudUpload size={40} className='text-muted-foreground' />
                            <div className='space-y-1 text-center'>
                                <p className="text-sm font-medium">Drag and drop your image here</p>
                                <p className="text-xs text-muted-foreground">PNG, JPG, WEBP or GIF (max. 2MB)</p>
                                <p className="text-xs text-muted-foreground">Recommended size: 2400×300px (8:1) or larger</p>
                            </div>
                            <Button variant='outline' className='mt-3 rounded-full'
                                onClick={(e) => {
                                    e.preventDefault()
                                    triggerFileInput()
                                }}>Select Image</Button>
                            <Input ref={fileInputRef} onChange={handleFileChange} type='file' className='hidden' accept='image/*'></Input>
                        </div>
                    </div>
                )
            case 1:
                return (
                    <div className={`w-full space-y-6`}>
                        <div className="relative h-[300px] w-full">
                            {originalImage && (
                                <Cropper
                                    image={originalImage}
                                    crop={crop}
                                    zoom={zoom}
                                    aspect={8 / 1}
                                    onCropChange={setCrop}
                                    onCropComplete={onCropComplete}
                                    onZoomChange={setZoom}
                                    showGrid={true}
                                    style={{
                                        containerStyle: {
                                            borderRadius: "16px",
                                            overflow: "hidden",
                                        },
                                    }}
                                />
                            )}
                        </div>
                        <div className="space-y-4">
                            <div className="space-y-1">
                                <div className="flex items-center mb-2">
                                    <ZoomIn className="h-4 w-4 mr-2" />
                                    <span className="text-sm font-medium">Zoom</span>
                                </div>
                                <Slider value={[zoom]} min={1} max={3} step={0.1} onValueChange={(values) => setZoom(values[0])} />
                            </div>
                        </div>
                        {isDesktop ?
                            <div className='flex justify-end gap-2'>
                                <Button variant={'redditGray'} onClick={() => {
                                    goToPreviousStep()
                                }}>

                                    <ArrowLeft className="h-4 w-4" />
                                    Back</Button>
                                <Button className='px-6' onClick={() => {
                                    createCroppedImage()
                                }}>
                                    Next
                                    <ArrowRight className="h-4 w-4" />
                                </Button>
                            </div>
                            :
                            <div className='flex flex-col justify-end gap-2'>
                                <Button className='p-6' onClick={() => {
                                    createCroppedImage()
                                }}>
                                    Preview
                                </Button>
                                <Button variant={'redditGray'} className='p-6' onClick={() => {
                                    goToPreviousStep()
                                }}>Back</Button>
                            </div>
                        }
                    </div>
                )
            case 2:
                return (
                    <div className="flex flex-col items-center space-y-6 mb-2">
                        <div className='space-y-4'>
                            <div className="text-center">
                                <h3 className="text-md font-medium">Your New Banner</h3>
                                <p className="text-sm text-muted-foreground">This is how your community banner will look</p>
                            </div>
                            <div className="flex justify-end aspect-[8/1] rounded-sm bg-cover bg-center bg-no-repeat"
                                style={{ backgroundImage: `url(${banner})` }}></div>
                        </div>
                        {isDesktop ?
                            <div className='flex justify-end w-full gap-2'>
                                <Button variant={'redditGray'} onClick={() => {
                                    if (isBannerGif) {
                                        setBannerChildrenStep(0)
                                    }
                                    else {
                                        goToPreviousStep()
                                    }
                                }}>
                                    <ArrowLeft className="h-4 w-4" />
                                    Back</Button>
                                <Button className='px-6' disabled={isSubmitting} onClick={handleFileUpload}>
                                    {
                                        isSubmitting ?
                                            <>
                                                <Loader2 className="mr-1 h-4 w-4 animate-spin" />Saving...
                                            </>
                                            :
                                            <>

                                                <Check className="h-4 w-4" />
                                                Save
                                            </>

                                    }
                                </Button>
                            </div>
                            :
                            <div className='flex flex-col w-full gap-2'>
                                <Button className='p-6' disabled={isSubmitting} onClick={handleFileUpload}>
                                    {
                                        isSubmitting ?
                                            <>
                                                <Loader2 className="mr-1 h-4 w-4 animate-spin" />Saving...
                                            </>
                                            :
                                            <>
                                                Save
                                            </>

                                    }
                                </Button>
                                <Button variant={'redditGray'} className='p-6' onClick={() => {
                                    if (isBannerGif) {
                                        setBannerChildrenStep(0)
                                    }
                                    else {
                                        goToPreviousStep()
                                    }
                                }}>Back</Button>
                            </div>
                        }
                    </div>
                )
        }
    }

    return (
        <div>
            {renderStepContent()}
            <div className={`flex justify-center space-x-2 mt-5`}>
                {stepArray.map((_, index) => (
                    <div
                        key={index}
                        className={`h-2 w-2 rounded-full transition-all duration-300 ${index === bannerChildrenStep
                            ? "bg-primary w-4"
                            : index < bannerChildrenStep
                                ? "bg-primary"
                                : "bg-muted"
                            }`}
                        aria-label={`Step ${index + 1}`}
                    />
                ))}
            </div>
        </div>
    )
}


const validateFileType = (file: File): boolean => {
    const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"]
    return validTypes.includes(file.type)
}

const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
        const image = new Image()
        image.addEventListener("load", () => resolve(image))
        image.addEventListener("error", (error) => reject(error))
        image.crossOrigin = "anonymous" // This helps avoid CORS issues
        image.src = url
    })

function getRadianAngle(degreeValue: number) {
    return (degreeValue * Math.PI) / 180
}

async function getCroppedImg(
    imageSrc: string,
    pixelCrop: Area,
    rotation = 0,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    flip = { horizontal: false, vertical: false },
): Promise<string> {
    const image = await createImage(imageSrc)
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")

    if (!ctx) {
        return imageSrc
    }

    const maxSize = Math.max(image.width, image.height)
    const safeArea = 2 * ((maxSize / 2) * Math.sqrt(2))

    // Set canvas size to match the bounding box
    canvas.width = safeArea
    canvas.height = safeArea

    // Draw rotated image
    ctx.translate(safeArea / 2, safeArea / 2)
    ctx.rotate(getRadianAngle(rotation))
    ctx.translate(-safeArea / 2, -safeArea / 2)

    // Draw the image in the center of the canvas
    ctx.drawImage(image, safeArea / 2 - image.width * 0.5, safeArea / 2 - image.height * 0.5)

    // Extract the cropped canvas
    const data = ctx.getImageData(0, 0, safeArea, safeArea)

    // Set canvas width to final desired crop size
    canvas.width = pixelCrop.width
    canvas.height = pixelCrop.height

    // Place the data at 0,0 on the canvas
    ctx.putImageData(
        data,
        Math.round(0 - safeArea / 2 + image.width * 0.5 - pixelCrop.x),
        Math.round(0 - safeArea / 2 + image.height * 0.5 - pixelCrop.y),
    )

    // Determine the original file type from the image source
    let fileType = "image/png" // Default to PNG
    if (imageSrc.startsWith("data:")) {
        const mimeMatch = imageSrc.match(/data:([^;]+);/)
        if (mimeMatch && mimeMatch[1]) {
            fileType = mimeMatch[1]
        }
    }

    // Use the original file type for the data URL
    const quality = fileType === "image/jpeg" ? 0.95 : 1
    return canvas.toDataURL(fileType, quality)
}

export default memo(UpdateBanner)
