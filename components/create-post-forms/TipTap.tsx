import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import React, { memo, useEffect, useState } from 'react'
import Placeholder from "@tiptap/extension-placeholder"
import MenuBar from './TipTapBar'
import { Card, CardContent } from '../ui/card'
import { usePathname } from 'next/navigation'
import { Button } from '../ui/button'
import { Loader2 } from 'lucide-react'
import { useCommentRefresh } from '@/app/context/CommentRefreshContext'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface TipTapProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: any
  setShowTipTap?: React.Dispatch<React.SetStateAction<boolean>>
  isSubmittingComment?: boolean
  isDirty?: boolean
  showTipTap?: boolean
}

export default memo(function TipTap({ form, setShowTipTap, isSubmittingComment, isDirty, showTipTap }: TipTapProps) {
  const [showAlert, setShowAlert] = useState(false)

  const pathname = usePathname()

  const isCommentMode = pathname.includes('/comments')

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { triggerRefresh } = isCommentMode ? useCommentRefresh() : { triggerRefresh: () => { } };

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: `${isCommentMode ? '' : 'What are your thoughts? (this part is optional)'}`,
      }),
    ],
    content: form.getValues('body'),
    editorProps: {
      attributes: {
        spellcheck: 'false',
        class: `prose prose-invert max-w-none ${isCommentMode ? 'min-h-20 prose-sm' : 'min-h-36'} m-2 text-primary-foreground-muted focus:outline-none`,
      },

    },
    onUpdate: ({ editor }) => {
      form.setValue("body", editor.getHTML(), {
        shouldValidate: true,
        shouldDirty: true,
      })
    },
  })

  useEffect(() => {
    if (showTipTap === true && editor) {
      editor.commands.focus('end')
    }
  }, [showTipTap, editor])

  if (!editor) {
    return (
      <p className='ml-2 text-sm text-primary-foreground-muted'>Loading editor...</p>
    )
  }

  const handleCancelClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    if (isDirty) {
      setShowAlert(true)
    }
    else {
      if (setShowTipTap !== undefined) { setShowTipTap(false); triggerRefresh() }
    }
  }

  const handleDiscard = () => {
    if (setShowTipTap !== undefined) { setShowTipTap(false); triggerRefresh() }
  }

  return (
    <>
      <Card className='py-1'>
        <CardContent className='px-2'>
          <MenuBar editor={editor} isCommentMode={isCommentMode} />
          <EditorContent editor={editor} />
          {
            isCommentMode &&
            <div className='flex gap-2 justify-end p-2 pr-1'>
              <Button
                onClick={(e) => handleCancelClick(e)}
                variant={'redditGray'}>
                Cancel
              </Button>
              <Button type='submit' variant={'default'}>
                {isSubmittingComment ? <>
                  <Loader2 className="mr-1 h-4 w-4 animate-spin" />Commenting...
                </> : 'Comment'}
              </Button>
            </div>
          }
        </CardContent>
      </Card>
      {
        isDirty && isCommentMode &&
        <AlertDialog open={showAlert} onOpenChange={setShowAlert}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Discard comment?</AlertDialogTitle>
              <AlertDialogDescription>
                You have a comment in progress, are you sure you want to discard it?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDiscard}>Discard</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      }
    </>
  )
})