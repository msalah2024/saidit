import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useSortable } from "@dnd-kit/react/sortable";
import { DragDropProvider } from '@dnd-kit/react';
import { move } from '@dnd-kit/helpers';
import {
    Card,
    CardContent,
} from "@/components/ui/card"
import Image from 'next/image';
import { Button } from '../ui/button';
import { Images, Pencil, Trash2 } from 'lucide-react';
import { useMediaQuery } from '@/hooks/use-media-query';
import { toast } from 'sonner'
import { ScrollArea } from '../ui/scroll-area';
import { DialogFooter } from '../ui/dialog';

type UploadedImage = {
    id: string
    file: File
    preview: string
    width: number
    height: number
    caption?: string
}

interface ImagesDialogContentProps {
    images: UploadedImage[]
    setImages: React.Dispatch<React.SetStateAction<UploadedImage[]>>
    setOpen: React.Dispatch<React.SetStateAction<boolean>>
    openFileDialog: (open: void) => void
}

interface SortableProps {
    img: UploadedImage
    index: number
    setLocalImages: React.Dispatch<React.SetStateAction<UploadedImage[]>>
}

function Sortable({ img, index, setLocalImages }: SortableProps) {
    const id = img.id
    const { ref, isDragging } = useSortable({ id, index });
    const [isEditingCaption, setIsEditingCaption] = useState(false);
    const [captionInput, setCaptionInput] = useState(img.caption || '');
    const inputRef = useRef<HTMLInputElement>(null);

    const handleDelete = () => {
        setLocalImages(prevItems => prevItems.filter(item => item.id !== id));
    }

    const handleCaptionClick = () => {
        setIsEditingCaption(true);
        setCaptionInput(img.caption || '');
    }

    const handleCaptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCaptionInput(e.target.value);
    }

    const handleCaptionSave = () => {
        setIsEditingCaption(false);
        setLocalImages(prevItems =>
            prevItems.map(item =>
                item.id === id ? { ...item, caption: captionInput } : item
            )
        );
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleCaptionSave();
        }
    }

    useEffect(() => {
        if (isEditingCaption && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isEditingCaption]);

    return (
        <li ref={ref} className="cursor-grab relative">
            <Card className='p-0 bg-background'
                style={isDragging ? {
                    transform: 'scale(1.02)',
                    boxShadow: 'inset 0px 0px 1px rgba(0,0,0,0.5), -1px 0 15px 0 rgba(34, 33, 81, 0.01), 0px 15px 15px 0 rgba(34, 33, 81, 0.25)'
                } : {}}
            >
                <CardContent className='relative items-center w-56 h-44 justify-center flex group'>
                    <div className="absolute rounded-lg hidden lg:block inset-0 overflow-hidden">
                        <div className="w-full h-full scale-120 opacity-30 blur-xl">
                            <Image
                                src={img.preview}
                                alt={img.preview}
                                fill
                                objectFit='cover'
                                draggable={false}
                                quality={5}
                                priority={index === 0}
                            />
                        </div>
                    </div>
                    <div className='relative z-10'>
                        <Image
                            src={img.preview}
                            width={img.width}
                            height={img.height}
                            alt={img.id}
                            draggable={false}
                            objectFit='contain'
                            style={{
                                maxHeight: '11rem',
                                width: 'auto'
                            }}
                        />
                    </div>

                    <Button variant={'ghost'}
                        onClick={handleDelete}
                        className='absolute top-2 right-2 z-50 bg-muted/80 hover:bg-muted
                         rounded-full opacity-100 lg:opacity-0 transition-all duration-300 lg:group-hover:opacity-100'
                        size={'icon'}>
                        <Trash2 />
                    </Button>

                    {!isEditingCaption && (
                        <Button variant={'ghost'}
                            onClick={handleCaptionClick}
                            className='absolute top-2 left-2 z-50 bg-background/80 hover:bg-muted
                             rounded-full opacity-100 lg:opacity-0 transition-all duration-300 lg:group-hover:opacity-100'
                            size={'sm'}>
                            <Pencil className="mr-1 h-4 w-4" />
                            {img.caption ? 'Edit caption' : 'Add caption'}
                        </Button>
                    )}

                    {isEditingCaption ? (
                        <div className='absolute bottom-2 left-0 right-0 mx-2 z-50'>
                            <div className="relative">
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={captionInput}
                                    onChange={handleCaptionChange}
                                    onBlur={handleCaptionSave}
                                    onKeyDown={handleKeyDown}
                                    className="w-full p-1.5 pr-8 text-sm bg-background border border-input rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                    placeholder="Enter image caption..."
                                    autoFocus
                                />
                                <button
                                    onClick={handleCaptionSave}
                                    className="absolute right-2 pr-1.5 top-1/2 transform -translate-y-1/2 text-primary hover:text-primary-dark"
                                >
                                    ✓
                                </button>
                            </div>
                        </div>
                    ) : (
                        img.caption && (
                            <div className='absolute bottom-2 left-0 right-0 mx-2 z-50'>
                                <div className="bg-black/60 text-white text-sm p-1.5 rounded-md text-center">
                                    {img.caption}
                                </div>
                            </div>
                        )
                    )}
                </CardContent>
            </Card>
        </li>
    );
}

export default function ImagesDialogContent({ images, setImages, setOpen }: ImagesDialogContentProps) {
    const [localImages, setLocalImages] = useState([...images])
    const isDesktop = useMediaQuery("(min-width: 768px)")
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleSubmit = () => {
        images.forEach(img => {
            if (!localImages.some(li => li.id === img.id)) {
                URL.revokeObjectURL(img.preview);
            }
        });
        setImages(localImages);
        setOpen(false);
    }

    const handleFiles = useCallback(
        async (files: FileList) => {
            const filesToProcess = Array.from(files)
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

            setLocalImages((prev) => [...prev, ...newImages])
            if (fileInputRef.current) {
                fileInputRef.current.value = ""
            }
        },
        [],)

    const handleFileInput = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            if (e.target.files) {
                handleFiles(e.target.files)
            }
        },
        [handleFiles],
    )

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

    const handleCancel = () => {
        setOpen(false)
    }

    const handleAddMore = () => {
        fileInputRef.current?.click()
    }

    useEffect(() => {
        setLocalImages(images)
    }, [images])

    return (
        <DragDropProvider
            onDragOver={(event) => {
                const { source, target } = event.operation;
                if (source && target) {
                    setLocalImages((items) => move(items, event));
                }
            }}
        >
            <ScrollArea className="max-h-[600px] h-full ">
                <ul className="flex flex-wrap gap-2 justify-center sm:justify-start">
                    {localImages.map((img, index) => (
                        <Sortable key={img.id} img={img} index={index} setLocalImages={setLocalImages} />
                    ))}
                </ul>
            </ScrollArea>
            <DialogFooter className='mr-4'>
                {
                    isDesktop ?
                        <div className='flex justify-between items-center w-full'>
                            <Button onClick={handleAddMore} variant={'redditGray'}>
                                <Images />
                                Add more images
                            </Button>
                            <div className='flex gap-2'>
                                <Button
                                    onClick={handleCancel}
                                    variant={'redditGray'}>
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleSubmit}
                                    variant={'default'}>
                                    Save
                                </Button>
                            </div>
                        </div>
                        :
                        <div className='flex flex-col gap-3 w-full'>
                            <Button variant={'default'}>
                                Save
                            </Button>
                            <Button variant={'redditGray'}>
                                <Images />
                                Add more images
                            </Button>
                            <Button variant={'redditGray'}>
                                Cancel
                            </Button>
                        </div>
                }
            </DialogFooter>
            <input ref={fileInputRef} type="file" multiple accept="image/*" onChange={handleFileInput} className="hidden" />
        </DragDropProvider>
    );

}
