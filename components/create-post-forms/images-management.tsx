"use client"
import { ImagePostSchema } from '@/schema'
import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { UseFormReturn } from 'react-hook-form'
import { z } from 'zod'
import { Card, CardContent } from '../ui/card'
import { CloudUpload, ImageMinus, Images, Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from "@/components/ui/carousel"
import Image from 'next/image'
import { Button } from '../ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import ImagesDialogContent from './images-dialog-content'


interface ImagesManagementProps {
  form: UseFormReturn<z.infer<typeof ImagePostSchema>>
}

interface UploadedImage {
  id: string
  file: File
  preview: string
  width: number
  height: number
  caption?: string
}

export default memo(function ImagesManagement({ form }: ImagesManagementProps) {
  const [images, setImages] = useState<UploadedImage[]>([])
  const [isDragOver, setIsDragOver] = useState(false)
  const [api, setApi] = useState<CarouselApi>()
  const [current, setCurrent] = useState(0)
  const [count, setCount] = useState(0)
  const [open, setOpen] = useState(false)
  const [showAlert, setShowAlert] = useState(false)
  const [isLocalImagesDirty, setLocalImagesDirty] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFiles = useCallback(
    async (files: FileList) => {
      const remainingSlots = 20 - images.length
      const filesToProcess = Array.from(files)
        .slice(0, remainingSlots)
        .filter((file) => file.type.startsWith("image/"))

      const newImages: UploadedImage[] = []

      for (const file of filesToProcess) {
        if (!validateFileType(file)) {
          toast.error("Invalid file type", {
            description: "Only JPEG, PNG, Webp, or GIF files are allowed."
          })
          return
        }
        try {
          const id = Math.random().toString(36).substr(2, 9)
          const preview = URL.createObjectURL(file)

          const dimensions = await getImageDimensions(file)

          newImages.push({
            id,
            file,
            preview,
            width: dimensions.width,
            height: dimensions.height,
          })
        } catch (error) {
          console.error("Error processing image:", error)
        }
      }

      setImages((prev) => [...prev, ...newImages])
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    },
    [images.length],)

  const getImageDimensions = (file: File): Promise<{ width: number; height: number }> => {
    return new Promise((resolve, reject) => {
      const img = new window.Image()
      img.crossOrigin = "anonymous"
      img.onload = () => {
        resolve({
          width: img.naturalWidth,
          height: img.naturalHeight,
        })
        URL.revokeObjectURL(img.src)
      }
      img.onerror = reject
      img.src = URL.createObjectURL(file)
    })
  }

  const validateFileType = (file: File): boolean => {
    const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"]
    return validTypes.includes(file.type)
  }

  console.log(images)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragOver(false)

      if (e.dataTransfer.files) {
        handleFiles(e.dataTransfer.files)
      }
    },
    [handleFiles],
  )

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        handleFiles(e.target.files)
      }
    },
    [handleFiles],
  )

  const openFileDialog = () => {
    fileInputRef.current?.click()
  }

  useEffect(() => {
    if (!api) return;

    const update = () => {
      const newCount = api.scrollSnapList().length;
      setCount(newCount);
      setCurrent(api.selectedScrollSnap() + 1);
    };

    update();

    api.on("select", update);
    api.on("reInit", update);

    return () => {
      api.off("select", update);
      api.off("reInit", update);
    };
  }, [api]);

  useEffect(() => {
    if (api && images.length > 0 && current > images.length) {
      api.scrollTo(current - 1);
    }
  }, [images, current, api]);

  const dots = useMemo(() =>
    Array.from({ length: count }).map((_, index) => (
      <div
        key={index}
        className={`h-2 w-2 rounded-full transition-all duration-300 ${index === current - 1
          ? "bg-primary-foreground w-4"
          : "bg-primary-foreground/40"
          }`}
        aria-label={`Step ${index + 1}`}
      />
    ))
    , [count, current])

  const handleDeleteAll = () => {
    setImages([])
  }

  const handleDeleteCurrent = () => {
    setImages(prev => prev.filter((_, index) => index + 1 !== current));
  }

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
    }
    else {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    }
  }, [open])

  useEffect(() => {
    if (images && images.length > 0) {
      const formattedImages = images.map((img) => ({
        image: img.file,
        width: img.width,
        height: img.height,
        caption: img.caption || "",
        alt: img.file.name
      }))

      form.setValue('images', formattedImages)
    }
    else {
      form.setValue('images', []);
    }
  }, [images, form])

  const handleDialogOpenChange = (nextOpen: boolean) => {
    if (!nextOpen && isLocalImagesDirty) {
      setShowAlert(true)
      return
    }
    setOpen(nextOpen)
  }

  return (
    <>
      {
        images.length === 0 ?
          <Card
            className={`border-2 border-dashed transition-colors cursor-pointer ${isDragOver ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50"
              }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={openFileDialog}
          >
            <CardContent className="flex flex-col items-center justify-center py-0 px-6">
              <div className={`rounded-full p-4 mb-4 ${isDragOver ? "bg-primary/10" : "bg-muted"}`}>
                <CloudUpload className={`h-8 w-8 ${isDragOver ? "text-primary" : "text-muted-foreground"}`} />
              </div>
              <div className="text-center space-y-2">
                <p className="text-md text-primary-foreground-muted font-medium">{isDragOver ? "Drop images here" : "Drag & drop images here"}</p>
                <p className="text-sm text-muted-foreground">or click to browse files</p>
                <p className="text-xs text-muted-foreground">PNG, JPG, WEBP or GIF (max. 2MB per image)</p>
              </div>
            </CardContent>
          </Card>
          :
          <Carousel setApi={setApi} className='border overflow-hidden rounded-xl'>
            <div className='relative group'>
              <CarouselContent className='max-h-[600px]'>
                {images.map((img, index) => (
                  <CarouselItem key={index} className='relative flex items-center justify-center'>
                    <div className="absolute hidden lg:block inset-0 overflow-hidden">
                      <div className="w-full h-full scale-120 opacity-30 blur-xl">
                        <Image
                          src={img.preview}
                          alt={img.preview}
                          fill
                          objectFit='cover'
                          quality={5}
                          priority={index === 0}
                        />
                      </div>
                    </div>
                    <div className='relative z-10'>
                      <Image
                        src={img.preview}
                        alt={img.preview}
                        width={img.width}
                        height={img.height}
                        objectFit='cover'
                        priority={index === 0}
                        style={
                          {
                            width: 'auto',
                            maxHeight: '600px',
                          }
                        }
                      />
                      {
                        img.caption &&
                        <div className='absolute bottom-12 left-0 right-0 mx-2 z-50'>
                          <div className="bg-black/60 line-clamp-8 text-white text-sm p-1.5 rounded-md text-center">
                            {img.caption}
                          </div>
                        </div>
                      }
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <div className='absolute top-2 left-2 gap-2 flex opacity-100 lg:opacity-0 transition-all duration-300 lg:group-hover:opacity-100'>
                <Button
                  onClick={(e) => {
                    e.preventDefault()
                    openFileDialog()
                  }}
                  variant={'ghost'} className='bg-background/80 hover:bg-muted rounded-full'>
                  <Images />
                  Add
                </Button>
                {
                  images.length > 1 &&
                  <Button
                    onClick={(e) => {
                      e.preventDefault()
                      setOpen(true)
                    }}
                    variant={'ghost'} className='bg-background/80 hover:bg-muted rounded-full'>
                    <Pencil />
                    Edit All
                  </Button>
                }
              </div>
              <div className='absolute top-2 right-2 gap-2 flex opacity-100 lg:opacity-0 transition-all duration-300 lg:group-hover:opacity-100'>
                {
                  images.length > 1 &&
                  <Button
                    onClick={(e) => {
                      e.preventDefault()
                      handleDeleteAll()
                    }}
                    variant={'ghost'} className='bg-background/80 hidden md:flex hover:bg-muted rounded-full'>
                    <Trash2 />
                    Delete All
                  </Button>
                }
                <Button
                  onClick={(e) => {
                    e.preventDefault()
                    handleDeleteCurrent()
                  }}
                  variant={'ghost'} className='bg-background/80 hover:bg-muted rounded-full'>
                  <ImageMinus />
                  Delete
                </Button>
              </div>
              <div className='absolute top-[50%] left-14 z-50'>
                <CarouselPrevious className='border-none bg-background/80 hover:bg-muted' />
              </div>
              <div className="absolute top-[50%] right-14 z-50">
                <CarouselNext className='border-none bg-background/80 hover:bg-muted' />
              </div>
              <div className={`flex justify-center absolute bottom-4 left-[50%] -translate-x-1/2 bg-muted/80 p-1 rounded-full space-x-2`}>
                {dots}
              </div>
            </div>
          </Carousel>
      }
      <Dialog open={open} onOpenChange={handleDialogOpenChange}>
        <DialogTrigger className='w-0 h-0 hidden'></DialogTrigger>
        <DialogContent className='md:max-w-3xl! md:w-full!'>
          <DialogHeader>
            <DialogTitle>
              Edit gallery
            </DialogTitle>
            <DialogDescription className='hidden'>
            </DialogDescription>
          </DialogHeader>
          <ImagesDialogContent
            images={images}
            setImages={setImages}
            setOpen={setOpen}
            openFileDialog={openFileDialog}
            showAlert={showAlert}
            setShowAlert={setShowAlert}
            isLocalImagesDirty={isLocalImagesDirty}
            setLocalImagesDirty={setLocalImagesDirty}
          />
        </DialogContent>
      </Dialog>
      <input ref={fileInputRef} type="file" multiple accept="image/*" onChange={handleFileInput} className="hidden" />
    </>
  )
})
