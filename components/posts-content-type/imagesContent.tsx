"use client"
import React, { memo, useEffect, useState, useCallback, useMemo } from 'react'
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from "@/components/ui/carousel"

// Move testImages outside the component so it's not recreated on each render
// interface ImagesContentProps {
//     image: string
// }

const testImages = [
    {
        src: "https://flowbite.s3.amazonaws.com/docs/gallery/masonry/image-2.jpg",
        alt: "Square image"
    },
    {
        src: "https://flowbite.s3.amazonaws.com/docs/gallery/masonry/image-3.jpg",
        alt: "Portrait image"
    },
    {
        src: "https://flowbite.s3.amazonaws.com/docs/gallery/masonry/image-4.jpg",
        alt: "Landscape image"
    },
    {
        src: "https://flowbite.s3.amazonaws.com/docs/gallery/masonry/image-5.jpg",
        alt: "Another square image"
    },
    {
        src: "https://flowbite.s3.amazonaws.com/docs/gallery/masonry/image-6.jpg",
        alt: "Wide image"
    }
]

export default memo(function ImagesContent() {
    const [api, setApi] = useState<CarouselApi>()
    const [current, setCurrent] = useState(0)
    const [count, setCount] = useState(0)
    // Memoize the select handler
    const handleSelect = useCallback(() => {
        if (api) {
            const selected = api.selectedScrollSnap() + 1
            setCurrent(prev => (prev !== selected ? selected : prev))
        }
    }, [api])

    useEffect(() => {
        if (!api) return

        const snaps = api.scrollSnapList().length
        setCount(snaps)
        setCurrent(api.selectedScrollSnap() + 1)

        api.on("select", handleSelect)
        return () => {
            api.off("select", handleSelect)
        }
    }, [api, handleSelect])

    // Memoize dots rendering
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

    return (
        <div className='flex flex-col'>
            <h4 className="scroll-m-20 mb-2 text-lg font-semibold tracking-tight">
                People stopped telling jokes
            </h4>
            <Carousel setApi={setApi} className='border overflow-hidden rounded-xl'>
                <div className='relative'>
                    <CarouselContent>
                        {testImages.map((img, index) => (
                            <CarouselItem key={index} className='relative p-0'>
                                <div className="absolute inset-0 z-0">
                                    <img src={img.src}
                                        alt={img.alt}
                                        className='blur-2xl scale-110 opacity-60 object-fill'
                                        loading="lazy"
                                        draggable={false}
                                    />
                                </div>
                                <div className='relative flex justify-center z-10 overflow-hidden rounded-xl'>
                                    <img src={img.src}
                                        alt={img.alt}
                                        className='object-cover aspect-square'
                                        loading="lazy"
                                        draggable={false}
                                    />
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
                    <div className={`flex justify-center absolute bottom-4 left-[50%] -translate-x-1/2 bg-muted/80 p-1 rounded-full space-x-2`}>
                        {dots}
                    </div>
                </div>
            </Carousel>
        </div>
    )
})