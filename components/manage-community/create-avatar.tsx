"use client"
import React, { memo, useCallback, useEffect, useRef, useState } from 'react'
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar"
import { ArrowLeft, ArrowRight, Check, CloudUpload, Loader2, RotateCw, ZoomIn } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Slider } from "@/components/ui/slider"
import Cropper from "react-easy-crop"
import type { Area, Point } from "react-easy-crop"
import { toast } from "sonner"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog'

interface CreateAvatarProps {
    isDesktop: boolean
    setGlobalAvatar: (banner: string | null) => void
}

const CreateAvatar = ({ isDesktop, setGlobalAvatar }: CreateAvatarProps) => {
    const [avatar, setAvatar] = useState<string | null>(null)
    const [originalImage, setOriginalImage] = useState<string | null>(null)
    const [step, setStep] = useState(0)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isDragging, setIsDragging] = useState(false)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [dragCounter, setDragCounter] = useState(0)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [isCropperOpen, setIsCropperOpen] = useState(false)
    const [crop, setCrop] = useState<Point>({ x: 0, y: 0 })
    const [zoom, setZoom] = useState(1)
    const [rotation, setRotation] = useState(0)
    const [isGif, setIsGif] = useState(false)
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [open, setOpen] = useState(false)

    const totalSteps = 2;
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
            setIsGif(isGifFile)

            const reader = new FileReader()
            reader.onload = (e) => {
                const imageDataUrl = e.target?.result as string
                setOriginalImage(imageDataUrl)

                if (isGifFile) {
                    setAvatar(imageDataUrl)
                    setStep(1)
                    setOpen(true)
                } else {
                    setOpen(true)
                }
            }
            reader.readAsDataURL(file)
        }
    }

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
                    description: "Only JPEG, PNG, webp, or GIF files are allowed."
                })
                return
            }

            const isGifFile = file.type === "image/gif"
            setIsGif(isGifFile)

            const reader = new FileReader()
            reader.onload = (e) => {
                const imageDataUrl = e.target?.result as string
                setOriginalImage(imageDataUrl)

                if (isGifFile) {
                    setAvatar(imageDataUrl)
                    setStep(1)
                    setOpen(true)
                } else {
                    setOpen(true)
                }
            }
            reader.readAsDataURL(file)
        }
    }

    const goToNextStep = () => {
        setStep((prev) => Math.min(prev + 1, 1))
    }

    useEffect(() => {
        if (!open) {
            setTimeout(() => {
                setAvatar(null)
                setOriginalImage(null)
                setCrop({ x: 0, y: 0 })
                setZoom(1)
                setIsGif(false)
                setStep(0)
                setCroppedAreaPixels(null)
                setIsSubmitting(false)
                if (fileInputRef.current) {
                    fileInputRef.current.value = ''
                }
            }, 300)
        }
    }, [open])

    const onCropComplete = useCallback((croppedArea: Area, croppedAreaPixels: Area) => {
        setCroppedAreaPixels(croppedAreaPixels)
    }, [])

    const createCroppedImage = useCallback(async () => {
        if (!originalImage || !croppedAreaPixels) return
        try {
            const croppedImage = await getCroppedImg(originalImage, croppedAreaPixels, rotation)
            setAvatar(croppedImage)
            goToNextStep()
        } catch (e) {
            console.error(e)
        }
    }, [originalImage, croppedAreaPixels, rotation])

    const handleFileUpload = async () => {
        if (!avatar) { return }

        try {
            setIsSubmitting(true)
            setGlobalAvatar(avatar)
            setOpen(false)

        } catch (error) {
            console.error(error)
        } finally {
            setIsSubmitting(false)
        }
    }

    const renderStepContent = () => {
        switch (step) {
            case 0:
                return (
                    <div className={`w-full ${isDesktop ? "space-y-6" : "space-y-4"}`}>
                        <div className="relative h-[300px] w-full">
                            {originalImage && (
                                <Cropper
                                    image={originalImage}
                                    crop={crop}
                                    zoom={zoom}
                                    rotation={rotation}
                                    aspect={1}
                                    onCropChange={setCrop}
                                    onCropComplete={onCropComplete}
                                    onZoomChange={setZoom}
                                    cropShape="round"
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

                            <div className="space-y-1">
                                <div className="flex items-center mb-2">
                                    <RotateCw className="h-4 w-4 mr-2" />
                                    <span className="text-sm font-medium">Rotation</span>
                                </div>
                                <Slider
                                    value={[rotation]}
                                    min={0}
                                    max={360}
                                    step={1}
                                    onValueChange={(values) => setRotation(values[0])}
                                />
                            </div>
                        </div>
                    </div>
                )
            case 1:
                return (
                    <div className="flex flex-col items-center space-y-6 mb-2">
                        <div className="text-center">
                            <h3 className="text-md font-medium">Your New Avatar</h3>
                            <p className="text-sm text-muted-foreground">This is how your community picture will look</p>
                        </div>
                        <div className="flex flex-col items-center gap-4">
                            <Avatar className="w-32 h-32 border-2 border-muted">
                                <AvatarImage src={avatar || ""} className='rounded-full' />
                                <AvatarFallback className="text-2xl bg-muted">?</AvatarFallback>
                            </Avatar>
                            <div className="flex items-center gap-4">
                                <Avatar className="w-16 h-16 border border-muted">
                                    <AvatarImage src={avatar || ""} className='rounded-full' />
                                    <AvatarFallback className="text-lg bg-muted">?</AvatarFallback>
                                </Avatar>

                                <Avatar className="w-10 h-10 border border-muted">
                                    <AvatarImage src={avatar || ""} className='rounded-full' />
                                    <AvatarFallback className="text-sm bg-muted">?</AvatarFallback>
                                </Avatar>
                            </div>
                        </div>
                    </div>
                )
        }
    }

    return (
        <div>
            <h4 className='text-sm'>Community avatar</h4>
            <div className={`flex flex-col items-center w-full mt-2 rounded-lg border-2 border-dashed p-4 
                           ${isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/20"}`}
                onDragEnter={handleDragEnter}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                <CloudUpload size={40} className='text-muted-foreground' />
                <div className='space-y-1 text-center mt-2'>
                    <p className="text-sm font-medium">Drag and drop your image here</p>
                    <p className="text-xs text-muted-foreground">PNG, JPG, WEBP or GIF (max. 2MB)</p>
                </div>
                <Button variant='outline' className='mt-3 rounded-full'
                    onClick={(e) => {
                        e.preventDefault()
                        triggerFileInput()
                    }}>Select Image</Button>
                <Input ref={fileInputRef} onChange={handleFileChange} type='file' className='hidden' accept='image/*'></Input>
            </div>

            <Dialog open={open} onOpenChange={setOpen} >
                <DialogTrigger asChild></DialogTrigger>
                <DialogContent >
                    <DialogHeader>
                        <DialogTitle>
                            {step === 0 && "Community avatar"}
                        </DialogTitle>
                        <DialogDescription>
                            {step === 0 && "Crop your community avatar"}
                        </DialogDescription>
                    </DialogHeader>
                    {
                        renderStepContent()
                    }
                    <div className={`flex justify-center space-x-2 ${isDesktop ? "mt-5" : "my-5"}`}>
                        {stepArray.map((_, index) => (
                            <div
                                key={index}
                                className={`h-2 w-2 rounded-full transition-all duration-300 ${index === step
                                    ? "bg-primary w-4"
                                    : index < step
                                        ? "bg-primary"
                                        : "bg-muted"
                                    }`}
                                aria-label={`Step ${index + 1}`}
                            />
                        ))}
                    </div>
                    {isDesktop ? (
                        <div className='flex w-full gap-2 justify-between mt-8'>
                            {
                                step === 0 || isGif ? <DialogClose asChild>
                                    <Button type='button' variant='redditGray'>Cancel</Button>
                                </DialogClose> :
                                    <Button type="button" variant="redditGray" onClick={() => {
                                        if (step === 1) {
                                            setStep(0)
                                        }
                                    }}>
                                        <div className="flex items-center gap-1">
                                            <ArrowLeft className="h-4 w-4" />
                                            Back
                                        </div>
                                    </Button>
                            }
                            <Button disabled={isSubmitting} className='rounded-full px-6' onClick={step === 0 ? createCroppedImage : step === 1 ? handleFileUpload : undefined}>
                                {
                                    step < 1 ? <div className='flex items-center gap-1'>Next <ArrowRight className="h-4 w-4" /></div>
                                        : <div className="flex items-center gap-1">
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
                                        </div>
                                }
                            </Button>
                        </div>
                    ) : (
                        <div className='flex w-full flex-col gap-2 justify-end my-4'>
                            <Button disabled={isSubmitting} className='rounded-full p-6' onClick={step === 0 ? createCroppedImage : step === 1 ? handleFileUpload : undefined}>
                                {
                                    step < 1 ? <div className='flex items-center gap-1'>Next</div>
                                        : <div className="flex items-center gap-1">
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
                                        </div>
                                }
                            </Button>
                            {
                                step === 0 || isGif ? <DialogClose asChild>
                                    <Button type='button' variant='redditGray' className='p-6'>Cancel</Button>
                                </DialogClose> :
                                    <Button type="button" variant="redditGray" onClick={() => {
                                        if (step === 1) {
                                            setStep(0)
                                        }
                                    }} className='p-6'>
                                        <div className="flex items-center gap-1">
                                            Back
                                        </div>
                                    </Button>
                            }
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}


const validateFileType = (file: File): boolean => {
    const validTypes = ["image/jpeg", "image/png", "image/gif"]
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

export default memo(CreateAvatar) 