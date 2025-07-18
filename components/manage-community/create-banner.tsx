import React, { memo, useCallback, useEffect, useRef, useState } from 'react'
import { toast } from "sonner"
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ArrowLeft, ArrowRight, Check, GalleryVertical, Loader2, ZoomIn } from 'lucide-react'
import Cropper from "react-easy-crop"
import type { Area, Point } from "react-easy-crop"
import { Slider } from '@/components/ui/slider'
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"

interface CreateBannerProps {
    isDesktop: boolean
    setGlobalBanner: (banner: string | null) => void
}

const CreateBanner = ({ isDesktop, setGlobalBanner }: CreateBannerProps) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [dragCounter, setDragCounter] = useState(0)
    const [isDragging, setIsDragging] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [banner, setBanner] = useState<string | null>(null)
    const [originalImage, setOriginalImage] = useState<string | null>(null)
    const [crop, setCrop] = useState<Point>({ x: 0, y: 0 })
    const [zoom, setZoom] = useState(1)
    const [isGif, setIsGif] = useState(false)
    const [step, setStep] = useState(0)
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)
    const [open, setOpen] = useState(false)

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
                    setBanner(imageDataUrl)
                    setStep(1)
                    setOpen(true)
                } else {
                    setOpen(true)
                }
            }
            reader.readAsDataURL(file)
        }
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
                    setBanner(imageDataUrl)
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

    const onCropComplete = useCallback((croppedArea: Area, croppedAreaPixels: Area) => {
        setCroppedAreaPixels(croppedAreaPixels)
    }, [])

    const createCroppedImage = useCallback(async () => {
        if (!originalImage || !croppedAreaPixels) return

        try {
            const croppedImage = await getCroppedImg(originalImage, croppedAreaPixels)
            setBanner(croppedImage)
            goToNextStep()
        } catch (e) {
            console.error(e)
            toast.error("Error", {
                description: "Failed to crop image. Please try again."
            })

        }
    }, [originalImage, croppedAreaPixels])

    const goToNextStep = () => {
        setStep((prev) => Math.min(prev + 1, 2))
    }

    useEffect(() => {
        if (!open) {
            setTimeout(() => {
                setBanner(null)
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

    const handleFileUpload = async () => {
        if (!banner) { return }

        try {
            setIsSubmitting(true)
            setGlobalBanner(banner)
            setOpen(false)
        } catch (error) {
            console.error(error)
        } finally {
            setIsSubmitting(true)
        }
    }


    const renderStepContent = () => {
        switch (step) {
            case 0: return (
                <div className="w-full space-y-6">
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
                </div>)

            case 1:
                return (
                    <div className='space-y-4 mb-2'>
                        <div className="text-center">
                            <h3 className="text-md font-medium">Your New Banner</h3>
                            <p className="text-sm text-muted-foreground">This is how your community banner will look</p>
                        </div>
                        <div className="flex justify-end aspect-[8/1] rounded-sm bg-cover bg-center bg-no-repeat"
                            style={{ backgroundImage: `url(${banner})` }}></div>
                    </div>

                )
        }
    }

    const totalSteps = 2;
    const stepArray = Array.from({ length: totalSteps }, (_, i) => i);

    return (
        <div>
            <h4 className='text-sm'>Community banner</h4>
            <div className={`flex flex-col items-center mt-2 w-full rounded-lg border-2 border-dashed p-4 
                           ${isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/20"}`}
                onDragEnter={handleDragEnter}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                <GalleryVertical size={40} className='text-muted-foreground' />
                <div className='space-y-1 text-center mt-2'>
                    <p className="text-sm font-medium">Drag and drop your image here</p>
                    <p className="text-xs text-muted-foreground">PNG, JPG, WEBP or GIF (max. 2MB)</p>
                    <p className="text-xs text-muted-foreground">Recommended size: 2400×300px (8:1) or larger</p>
                </div>
                <Button variant='outline' className='mt-3 rounded-full' onClick={(e) => {
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
                            {step === 0 && "Community banner"}
                        </DialogTitle>
                        <DialogDescription>
                            {step === 0 && "Crop your community banner"}
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

async function getCroppedImg(imageSrc: string, pixelCrop: Area): Promise<string> {
    const image = await createImage(imageSrc)
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")

    if (!ctx) {
        return imageSrc
    }

    // Set canvas size to match the cropped area
    canvas.width = pixelCrop.width
    canvas.height = pixelCrop.height

    // Draw the cropped image onto the canvas
    ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        pixelCrop.width,
        pixelCrop.height,
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
export default memo(CreateBanner) 