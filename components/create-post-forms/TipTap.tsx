
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import React, { memo } from 'react'
import Placeholder from "@tiptap/extension-placeholder"
import MenuBar from './TipTapBar'
import { Card, CardContent } from '../ui/card'

interface TipTapProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: any
}

export default memo(function TipTap({ form }: TipTapProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: "What are your thoughts? (this part is optional)",
      }),
    ],
    content: form.getValues('body'),
    editorProps: {
      attributes: {
        spellcheck: 'false',
        class: 'prose prose-invert max-w-none min-h-36 m-2 text-primary-foreground-muted focus:outline-none',
      },

    },
    onUpdate: ({ editor }) => {
      form.setValue("body", editor.getHTML(), {
        shouldValidate: true,
        shouldDirty: true,
      })
    },
  })

  if (!editor) {
    return (
      <p className='ml-4 text-sm text-primary-foreground-muted'>Loading editor...</p>
    )
  }

  return (
    <Card className='py-1'>
      <CardContent className='px-2'>
        <MenuBar editor={editor} />
        <EditorContent editor={editor} />
      </CardContent>
    </Card>

  )
})