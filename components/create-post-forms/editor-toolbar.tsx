"use client"

import type { Editor } from "@tiptap/react"
import {
    Bold,
    Italic,
    List,
    ListOrdered,
    Quote,
    Redo,
    Strikethrough,
    Undo,
    LinkIcon,
    ImageIcon,
    Code,
    Heading1,
    Heading2,
    Heading3,
    Subscript,
} from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

interface EditorToolbarProps {
    editor: Editor | null
}

export function EditorToolbar({ editor }: EditorToolbarProps) {
    const [linkUrl, setLinkUrl] = useState("")
    const [imageUrl, setImageUrl] = useState("")

    if (!editor) {
        return null
    }

    const addLink = () => {
        if (linkUrl) {
            editor.chain().focus().extendMarkRange("link").setLink({ href: linkUrl }).run()
            setLinkUrl("")
        }
    }

    const addImage = () => {
        if (imageUrl) {
            editor.chain().focus().setImage({ src: imageUrl }).run()
            setImageUrl("")
        }
    }

    return (
        <TooltipProvider>
            <div className="border-b flex flex-wrap items-center p-2 gap-1">
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => editor.chain().focus().toggleBold().run()}
                            className={cn(
                                "h-8 w-8 p-0 hover:bg-muted",
                                editor.isActive("bold") && "bg-primary text-primary-foreground hover:bg-primary/90",
                            )}
                        >
                            <Bold className="h-4 w-4" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>Bold (Ctrl+B)</TooltipContent>
                </Tooltip>

                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => editor.chain().focus().toggleItalic().run()}
                            className={cn(
                                "h-8 w-8 p-0 hover:bg-muted",
                                editor.isActive("italic") && "bg-primary text-primary-foreground hover:bg-primary/90",
                            )}
                        >
                            <Italic className="h-4 w-4" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>Italic (Ctrl+I)</TooltipContent>
                </Tooltip>

                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => editor.chain().focus().toggleStrike().run()}
                            className={cn(
                                "h-8 w-8 p-0 hover:bg-muted",
                                editor.isActive("strike") && "bg-primary text-primary-foreground hover:bg-primary/90",
                            )}
                        >
                            <Strikethrough className="h-4 w-4" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>Strikethrough (Ctrl+Shift+S)</TooltipContent>
                </Tooltip>

                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => editor.chain().focus().toggleCode().run()}
                            className={cn(
                                "h-8 w-8 p-0 hover:bg-muted",
                                editor.isActive("code") && "bg-primary text-primary-foreground hover:bg-primary/90",
                            )}
                        >
                            <Code className="h-4 w-4" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>Code (Ctrl+E)</TooltipContent>
                </Tooltip>

                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => editor.chain().focus().toggleSubscript().run()}
                            className={cn(
                                "h-8 w-8 p-0 hover:bg-muted",
                                editor.isActive("subscript") && "bg-primary text-primary-foreground hover:bg-primary/90",
                            )}
                        >
                            <Subscript className="h-4 w-4" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>Subscript (Ctrl+,)</TooltipContent>
                </Tooltip>

                <div className="w-px h-6 bg-border mx-1"></div>

                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                            className={cn(
                                "h-8 w-8 p-0 hover:bg-muted",
                                editor.isActive("heading", { level: 1 }) && "bg-primary text-primary-foreground hover:bg-primary/90",
                            )}
                        >
                            <Heading1 className="h-4 w-4" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>Heading 1 (Ctrl+Alt+1)</TooltipContent>
                </Tooltip>

                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                            className={cn(
                                "h-8 w-8 p-0 hover:bg-muted",
                                editor.isActive("heading", { level: 2 }) && "bg-primary text-primary-foreground hover:bg-primary/90",
                            )}
                        >
                            <Heading2 className="h-4 w-4" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>Heading 2 (Ctrl+Alt+2)</TooltipContent>
                </Tooltip>

                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                            className={cn(
                                "h-8 w-8 p-0 hover:bg-muted",
                                editor.isActive("heading", { level: 3 }) && "bg-primary text-primary-foreground hover:bg-primary/90",
                            )}
                        >
                            <Heading3 className="h-4 w-4" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>Heading 3 (Ctrl+Alt+3)</TooltipContent>
                </Tooltip>

                <div className="w-px h-6 bg-border mx-1"></div>

                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => editor.chain().focus().toggleBulletList().run()}
                            className={cn(
                                "h-8 w-8 p-0 hover:bg-muted",
                                editor.isActive("bulletList") && "bg-primary text-primary-foreground hover:bg-primary/90",
                            )}
                        >
                            <List className="h-4 w-4" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>Bullet List (Ctrl+Shift+8)</TooltipContent>
                </Tooltip>

                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => editor.chain().focus().toggleOrderedList().run()}
                            className={cn(
                                "h-8 w-8 p-0 hover:bg-muted",
                                editor.isActive("orderedList") && "bg-primary text-primary-foreground hover:bg-primary/90",
                            )}
                        >
                            <ListOrdered className="h-4 w-4" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>Numbered List (Ctrl+Shift+7)</TooltipContent>
                </Tooltip>

                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => editor.chain().focus().toggleBlockquote().run()}
                            className={cn(
                                "h-8 w-8 p-0 hover:bg-muted",
                                editor.isActive("blockquote") && "bg-primary text-primary-foreground hover:bg-primary/90",
                            )}
                        >
                            <Quote className="h-4 w-4" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>Quote (Ctrl+Shift+B)</TooltipContent>
                </Tooltip>

                <div className="w-px h-6 bg-border mx-1"></div>

                <Tooltip>
                    <TooltipTrigger asChild>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button disabled variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-muted">
                                    <LinkIcon className="h-4 w-4" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-80">
                                <div className="grid gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="link">Link URL</Label>
                                        <div className="flex gap-2">
                                            <Input
                                                id="link"
                                                placeholder="https://example.com"
                                                value={linkUrl}
                                                onChange={(e) => setLinkUrl(e.target.value)}
                                            />
                                            <Button onClick={addLink}>Add</Button>
                                        </div>
                                    </div>
                                </div>
                            </PopoverContent>
                        </Popover>
                    </TooltipTrigger>
                    <TooltipContent>Insert Link (Ctrl+K)</TooltipContent>
                </Tooltip>

                <Tooltip>
                    <TooltipTrigger asChild>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button disabled variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-muted">
                                    <ImageIcon className="h-4 w-4" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-80">
                                <div className="grid gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="image">Image URL</Label>
                                        <div className="flex gap-2">
                                            <Input
                                                id="image"
                                                placeholder="https://example.com/image.jpg"
                                                value={imageUrl}
                                                onChange={(e) => setImageUrl(e.target.value)}
                                            />
                                            <Button onClick={addImage}>Add</Button>
                                        </div>
                                    </div>
                                </div>
                            </PopoverContent>
                        </Popover>
                    </TooltipTrigger>
                    <TooltipContent>Insert Image (Ctrl+Alt+I)</TooltipContent>
                </Tooltip>

                <div className="w-px h-6 bg-border mx-1"></div>

                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => editor.chain().focus().undo().run()}
                            disabled={!editor.can().undo()}
                            className="h-8 w-8 p-0 hover:bg-muted"
                        >
                            <Undo className="h-4 w-4" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>Undo (Ctrl+Z)</TooltipContent>
                </Tooltip>

                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => editor.chain().focus().redo().run()}
                            disabled={!editor.can().redo()}
                            className="h-8 w-8 p-0 hover:bg-muted"
                        >
                            <Redo className="h-4 w-4" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>Redo (Ctrl+Y)</TooltipContent>
                </Tooltip>
            </div>
        </TooltipProvider>
    )
}

