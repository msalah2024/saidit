"use client"
import React, { memo } from 'react'
import { Editor, useEditorState } from '@tiptap/react'
import { Button } from '../ui/button'
import { Bold, Code, Heading1, Heading2, Heading3, Italic, List, ListOrdered, Quote, Redo, SquareChevronRight, Strikethrough, Undo } from 'lucide-react'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default memo(function MenuBar({ editor }: any) {
    const editorState = useEditorState({
        editor,
        // This function will be called every time the editor state changes
        selector: ({ editor }: { editor: Editor }) => ({
            // It will only re-render if the bold or italic state changes
            isBold: editor?.isActive('bold'),
            isItalic: editor?.isActive('italic'),
            isStrike: editor?.isActive('strike'),
            isCode: editor?.isActive('code'),
            isH1: editor?.isActive('heading', { level: 1 }),
            isH2: editor?.isActive('heading', { level: 2 }),
            isH3: editor?.isActive('heading', { level: 3 }),
            isBullet: editor?.isActive('bulletList'),
            isOrdered: editor?.isActive('orderedList'),
            isCodeBlock: editor?.isActive('codeBlock'),
            isBlockQuote: editor?.isActive('blockquote')
        }),
    })

    if (!editor) {
        return null
    }

    return (
        <div className="control-group border-b py-1">
            <div className="button-group">
                <Button
                    variant={editorState.isBold ? 'default' : 'ghost'}
                    onClick={(e) => {
                        e.preventDefault()
                        editor.chain().focus().toggleBold().run()
                    }}
                    size={'icon'}
                    className='rounded-full hover:bg-reddit-gray'
                >
                    <Bold />
                </Button>
                <Button
                    variant={editorState.isItalic ? 'default' : 'ghost'}
                    onClick={(e) => {
                        e.preventDefault()
                        editor.chain().focus().toggleItalic().run()
                    }}
                    size={'icon'}
                    className='rounded-full hover:bg-reddit-gray'
                >
                    <Italic />
                </Button>
                <Button
                    variant={editorState.isStrike ? 'default' : 'ghost'}
                    onClick={(e) => {
                        e.preventDefault()
                        editor.chain().focus().toggleStrike().run()
                    }}
                    size={'icon'}
                    className='rounded-full hover:bg-reddit-gray'
                >
                    <Strikethrough />
                </Button>
                <Button
                    variant={editorState.isCode ? 'default' : 'ghost'}
                    onClick={(e) => {
                        e.preventDefault()
                        editor.chain().focus().toggleCode().run()
                    }}
                    size={'icon'}
                    className='rounded-full hover:bg-reddit-gray'
                >
                    <Code />
                </Button>
                <Button
                    variant={editorState.isH1 ? 'default' : 'ghost'}
                    onClick={(e) => {
                        e.preventDefault()
                        editor.chain().focus().toggleHeading({ level: 1 }).run()
                    }}
                    size={'icon'}
                    className='rounded-full hover:bg-reddit-gray'
                >
                    <Heading1 />
                </Button>
                <Button
                    variant={editorState.isH2 ? 'default' : 'ghost'}
                    onClick={(e) => {
                        e.preventDefault()
                        editor.chain().focus().toggleHeading({ level: 2 }).run()
                    }}
                    size={'icon'}
                    className='rounded-full hover:bg-reddit-gray'
                >
                    <Heading2 />
                </Button>
                <Button
                    variant={editorState.isH3 ? 'default' : 'ghost'}
                    onClick={(e) => {
                        e.preventDefault()
                        editor.chain().focus().toggleHeading({ level: 3 }).run()
                    }}
                    size={'icon'}
                    className='rounded-full hover:bg-reddit-gray'
                >
                    <Heading3 />
                </Button>
                <Button
                    variant={editorState.isBullet ? 'default' : 'ghost'}
                    onClick={(e) => {
                        e.preventDefault()
                        editor.chain().focus().toggleBulletList().run()
                    }}
                    size={'icon'}
                    className='rounded-full hover:bg-reddit-gray'
                >
                    <List />
                </Button>
                <Button
                    variant={editorState.isOrdered ? 'default' : 'ghost'}
                    onClick={(e) => {
                        e.preventDefault()
                        editor.chain().focus().toggleOrderedList().run()
                    }}
                    size={'icon'}
                    className='rounded-full hover:bg-reddit-gray'
                >
                    <ListOrdered />
                </Button>
                <Button
                    variant={editorState.isCodeBlock ? 'default' : 'ghost'}
                    onClick={(e) => {
                        e.preventDefault()
                        editor.chain().focus().toggleCodeBlock().run()
                    }}
                    size={'icon'}
                    className='rounded-full hover:bg-reddit-gray'
                >
                    <SquareChevronRight />
                </Button>
                <Button
                    variant={editorState.isBlockQuote ? 'default' : 'ghost'}
                    onClick={(e) => {
                        e.preventDefault()
                        editor.chain().focus().toggleBlockquote().run()
                    }}
                    size={'icon'}
                    className='rounded-full hover:bg-reddit-gray'
                >
                    <Quote />
                </Button>
                <Button
                    variant={'ghost'}
                    size={'icon'}
                    className='hover:bg-reddit-gray rounded-full'
                    onClick={(e) => {
                        e.preventDefault()
                        editor.chain().focus().undo().run()
                    }}>
                    <Undo />
                </Button>
                <Button
                    variant={'ghost'}
                    size={'icon'}
                    className='hover:bg-reddit-gray rounded-full'
                    onClick={(e) => {
                        e.preventDefault()
                        editor.chain().focus().redo().run()
                    }}>
                    <Redo />
                </Button>
            </div>
        </div >
    )
})
