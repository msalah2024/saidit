"use client"

import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Image from "@tiptap/extension-image"
import Link from "@tiptap/extension-link"
import Placeholder from "@tiptap/extension-placeholder"
import Subscript from "@tiptap/extension-subscript"
import { EditorToolbar } from "./editor-toolbar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export function TextContentForm() {
    const editor = useEditor({
        extensions: [
            StarterKit,
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: "text-primary underline underline-offset-2 hover:no-underline",
                },
            }),
            Image.configure({
                allowBase64: true,
                HTMLAttributes: {
                    class: "rounded-lg max-h-80 object-contain my-4",
                },
            }),
            Placeholder.configure({
                placeholder: "What are your thoughts?",
            }),
            Subscript,
        ],
        content: "",
        editorProps: {
            attributes: {
                class: cn(
                    "prose prose-sm dark:prose-invert focus:outline-none max-w-none min-h-[150px] p-4",
                    // Base editor styles
                    "outline-none",
                    // Placeholder styles
                    "[&_p.is-editor-empty:first-child::before]:text-muted-foreground [&_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)] [&_p.is-editor-empty:first-child::before]:float-left [&_p.is-editor-empty:first-child::before]:h-0 [&_p.is-editor-empty:first-child::before]:pointer-events-none",
                    // Content spacing
                    "[&>*+*]:mt-3",
                    // Headings
                    "[&_h1]:text-3xl [&_h1]:font-semibold [&_h1]:mt-8 [&_h1]:mb-4 [&_h1]:leading-tight",
                    "[&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:mt-6 [&_h2]:mb-3 [&_h2]:leading-tight",
                    "[&_h3]:text-xl [&_h3]:font-semibold [&_h3]:mt-5 [&_h3]:mb-2 [&_h3]:leading-tight",
                    // Lists
                    "[&_ul]:list-disc [&_ul]:pl-6 [&_ul]:my-2",
                    "[&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:my-2",
                    "[&_li]:my-1 [&_li]:block",
                    "[&_ul_li::marker]:text-foreground",
                    "[&_ol_li::marker]:text-foreground [&_ol_li::marker]:font-semibold",
                    // Nested lists
                    "[&_ul_ul]:list-[circle] [&_ul_ul_ul]:list-[square]",
                    // Blockquotes
                    "[&_blockquote]:border-l-4 [&_blockquote]:border-primary [&_blockquote]:pl-4 [&_blockquote]:my-4 [&_blockquote]:italic [&_blockquote]:text-muted-foreground",
                    // Code
                    "[&_code]:bg-muted [&_code]:rounded [&_code]:px-2 [&_code]:py-1 [&_code]:text-sm [&_code]:font-mono",
                    "[&_pre]:bg-muted [&_pre]:rounded-lg [&_pre]:p-4 [&_pre]:overflow-x-auto [&_pre]:my-4",
                    "[&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_pre_code]:rounded-none",
                    // Images
                    "[&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-lg [&_img]:my-4",
                    // Selection
                    "[&_::selection]:bg-primary/30 [&_::selection]:text-foreground",
                ),
            },
        },
    })

    const handleSubmit = () => {
        if (editor) {
            console.log(editor.getHTML())
            // Here you would typically send the content to your backend
            alert("Post content: " + editor.getHTML())
        }
    }

    return (
        <div className="space-y-4">
            <Card className="border rounded-md pt-0 gap-0">
                <EditorToolbar editor={editor} />
                <div className="relative">
                    <EditorContent editor={editor} />
                </div>
            </Card>

            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">{/* Additional buttons could go here */}</div>
                <Button onClick={handleSubmit}>Post</Button>
            </div>
        </div>
    )
}

