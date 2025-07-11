"use client"
import React, { memo, useEffect, useState, useCallback, useMemo } from 'react'
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from "@/components/ui/carousel"
import Image from 'next/image'
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from '../ui/button'
import { X } from 'lucide-react'
import { PostsWithAuthor } from '@/complexTypes'
import { usePathname } from 'next/navigation'
import DOMPurify from 'dompurify';

interface ImagesContentProps {
    post: PostsWithAuthor
}

export default memo(function ImagesContent({ post }: ImagesContentProps) {
    const [api, setApi] = useState<CarouselApi>()
    const [current, setCurrent] = useState(0)
    const [count, setCount] = useState(0)
    const [open, setOpen] = useState(false)
    const [dialogApi, setDialogApi] = useState<CarouselApi>()
    const [clickedImageIndex, setClickedImageIndex] = useState(0)
    const pathname = usePathname()
    const cleanContent = DOMPurify.sanitize(post?.content ?? "");
    const isEmptyParagraph = cleanContent.trim() === '<p></p>' || cleanContent.trim() === '';

    const isPostPage = pathname.includes("/comments")

    useEffect(() => {
        if (api && current > 0) {
            const targetIndex = current - 1
            if (api.selectedScrollSnap() !== targetIndex) {
                api.scrollTo(targetIndex)
            }
        }
        if (dialogApi && current > 0) {
            const targetIndex = current - 1
            if (dialogApi.selectedScrollSnap() !== targetIndex) {
                dialogApi.scrollTo(targetIndex)
            }
        }
    }, [current, api, dialogApi])

    useEffect(() => {
        if (!api) return

        const snaps = api.scrollSnapList().length
        setCount(snaps)
        setCurrent(api.selectedScrollSnap() + 1)

        const handleSelect = () => {
            const selected = api.selectedScrollSnap() + 1
            setCurrent(selected)
        }

        api.on("select", handleSelect)
        return () => {
            api.off("select", handleSelect)
        }
    }, [api])

    useEffect(() => {
        if (!dialogApi) return

        const handleDialogSelect = () => {
            const selected = dialogApi.selectedScrollSnap() + 1
            setCurrent(selected)
        }

        dialogApi.on("select", handleDialogSelect)
        return () => {
            dialogApi.off("select", handleDialogSelect)
        }
    }, [dialogApi])

    const handleImageClick = useCallback((index: number) => {
        setClickedImageIndex(index)
        setCurrent(index + 1)
        setOpen(true)
    }, [])

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

    const dialogDots = useMemo(
        () =>
            Array.from({ length: count }).map((_, index) => (
                <div
                    key={index}
                    className={`h-2 w-2 rounded-full transition-all duration-300 ${index === current - 1
                        ? "bg-primary-foreground w-4"
                        : "bg-primary-foreground/40"
                        }`}
                    aria-label={`Step ${index + 1}`}
                />
            )),
        [count, current],
    )

    return (
        <div className='flex flex-col relative'>
            <h1 className={`scroll-m-20 ml-1 mb-2 ${isPostPage ? 'text-2xl' : 'text-lg'}  font-medium tracking-tight`}>
                {post.title}
            </h1>
            <Carousel setApi={setApi} className='border overflow-hidden rounded-xl z-10'>
                <div className='relative'>
                    <CarouselContent>
                        {post.post_attachments.map((img, index) => (
                            <CarouselItem
                                onClick={() => {
                                    handleImageClick(index)
                                }}
                                key={index} className='relative flex items-center justify-center hover:cursor-pointer '>
                                <div className="absolute hidden lg:block inset-0 overflow-hidden">
                                    <div className="w-full h-full scale-120 opacity-30 blur-xl">
                                        <Image
                                            src={img.file_url}
                                            alt={img.alt_text || ""}
                                            fill
                                            objectFit='cover'
                                            quality={5}
                                            priority={index === 0}
                                        />
                                    </div>
                                </div>
                                <div className='relative z-10'>
                                    <Image

                                        src={img.file_url}
                                        alt={img.alt_text || ""}
                                        width={img.width || undefined}
                                        height={img.height || undefined}
                                        objectFit='cover'
                                        priority={index === 0}
                                        style={
                                            {
                                                width: 'auto',
                                                maxHeight: '34rem'
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
                    <div className='absolute top-[50%] left-14 z-50'>
                        <CarouselPrevious className='border-none bg-background/80 hover:bg-muted' />
                    </div>
                    <div className="absolute top-[50%] right-14 z-50">
                        <CarouselNext className='border-none bg-background/80 hover:bg-muted' />
                    </div>
                    {
                        post.post_attachments.length > 1 &&
                        <div className={`flex justify-center absolute bottom-4 left-[50%] -translate-x-1/2 bg-muted/80 p-1 rounded-full space-x-2`}>
                            {dots}
                        </div>
                    }
                </div>
            </Carousel>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger className='w-0 h-0 hidden' asChild></DialogTrigger>
                <DialogContent
                    showCloseButton={false}
                    onOpenAutoFocus={(e) => e.preventDefault()}
                    className='w-vh! h-dvh! max-w-none! p-0 border-none rounded-none transition-none'>
                    <DialogHeader className='hidden'>
                        <DialogTitle className='hidden'></DialogTitle>
                        <DialogDescription className='hidden'></DialogDescription>
                    </DialogHeader>
                    <Carousel
                        setApi={setDialogApi}
                        className='overflow-hidden'
                        opts={{
                            startIndex: clickedImageIndex
                        }}
                    >
                        <div className='relative'>
                            <DialogClose className='absolute right-5 top-5 z-50' asChild>
                                <Button variant={'redditGray'} size={'icon'}>
                                    <X />
                                </Button>
                            </DialogClose>
                            <CarouselContent className='h-dvh'>
                                {post.post_attachments.map((img, index) => (
                                    <CarouselItem key={index} className='relative flex items-center justify-center'>
                                        <div className="absolute hidden lg:block inset-0 overflow-hidden">
                                            <div className="w-full h-full scale-140 opacity-30 blur-lg">
                                                <Image
                                                    src={img.file_url}
                                                    alt={img.alt_text || ""}
                                                    fill
                                                    objectFit='cover'
                                                    quality={5}
                                                    priority={index === 0}
                                                />
                                            </div>
                                        </div>
                                        <div className='relative z-10'>
                                            <Image
                                                onClick={() => {
                                                    setOpen(true)
                                                }}
                                                src={img.file_url}
                                                alt={img.alt_text || ""}
                                                width={img.width || undefined}
                                                height={img.height || undefined}
                                                objectFit='contain'
                                                priority={index === clickedImageIndex}
                                                style={
                                                    {
                                                        width: 'auto',
                                                        maxHeight: '100dvh',
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
                            <div className='absolute top-[50%] left-14 z-50'>
                                <CarouselPrevious className='border-none bg-background/80 hover:bg-muted' />
                            </div>
                            <div className="absolute top-[50%] right-14 z-50">
                                <CarouselNext className='border-none bg-background/80 hover:bg-muted' />
                            </div>
                            {
                                post.post_attachments.length > 1 &&
                                <div className={`flex justify-center absolute bottom-4 left-[50%] -translate-x-1/2 bg-muted/80 p-1 rounded-full space-x-2`}>
                                    {dialogDots}
                                </div>
                            }
                        </div>
                    </Carousel>
                </DialogContent>
            </Dialog>
            {
                isPostPage && !isEmptyParagraph &&
                <div
                    className='ml-2 mt-2 text-primary-foreground-muted prose 
                                prose-strong:text-primary-foreground-muted
                                prose-code:text-primary-foreground-muted
                                prose-li:p:my-0
                                prose-p:my-0
                                text-base
                                prose-h1:text-2xl
                                prose-h2:text-xl
                                prose-h3:text-lg
                                prose-blockquote:p:text-primary-foreground-muted
                                prose-blockquote:border-l-primary
                                prose-headings:text-primary-foreground-muted'
                    dangerouslySetInnerHTML={{ __html: cleanContent }}
                />

            }
        </div>
    )
})