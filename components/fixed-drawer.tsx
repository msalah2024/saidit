"use client"

import * as React from "react"
import { Drawer as DrawerPrimitive } from "vaul"

import { cn } from "@/lib/utils"

const Drawer = ({
  shouldScaleBackground = true,
  ...props
}: React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Root>) => (
  <DrawerPrimitive.Root shouldScaleBackground={shouldScaleBackground} {...props} />
)
Drawer.displayName = "Drawer"

const DrawerTrigger = DrawerPrimitive.Trigger

const DrawerPortal = DrawerPrimitive.Portal

const DrawerClose = DrawerPrimitive.Close

const DrawerOverlay = ({ className, ...props }: React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Overlay>) => (
  <DrawerPrimitive.Overlay className={cn("fixed inset-0 z-50 bg-black/80", className)} {...props} />
)
DrawerOverlay.displayName = DrawerPrimitive.Overlay.displayName

const DrawerContent = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Content>
>(({ className, children, ...props }, ref) => {
  const contentRef = React.useRef<HTMLDivElement>(null)
  const [contentHeight, setContentHeight] = React.useState<number | null>(null)

  // Function to update the content height
  const updateContentHeight = React.useCallback(() => {
    if (contentRef.current) {
      // Get the actual content height
      const height = contentRef.current.scrollHeight
      setContentHeight(height)
    }
  }, [])

  // Update height on mount, content change, and after input blur
  React.useEffect(() => {
    updateContentHeight()

    // Add a small delay to ensure content is fully rendered
    const timer = setTimeout(updateContentHeight, 100)

    // Setup mutation observer to detect content changes
    const observer = new MutationObserver(updateContentHeight)

    if (contentRef.current) {
      observer.observe(contentRef.current, {
        childList: true,
        subtree: true,
        attributes: true,
        characterData: true,
      })
    }

    // Handle input focus/blur events
    const handleFocusBlur = () => {
      // Delay to allow keyboard to fully show/hide
      setTimeout(updateContentHeight, 300)
    }

    // Add event listeners to all inputs in the drawer
    const inputs = contentRef.current?.querySelectorAll("input, textarea")
    inputs?.forEach((input) => {
      input.addEventListener("focus", handleFocusBlur)
      input.addEventListener("blur", handleFocusBlur)
    })

    // Handle resize events
    window.addEventListener("resize", updateContentHeight)

    return () => {
      clearTimeout(timer)
      observer.disconnect()
      inputs?.forEach((input) => {
        input.removeEventListener("focus", handleFocusBlur)
        input.removeEventListener("blur", handleFocusBlur)
      })
      window.removeEventListener("resize", updateContentHeight)
    }
  }, [updateContentHeight, children])

  return (
    <DrawerPortal>
      <DrawerOverlay />
      <DrawerPrimitive.Content
        ref={ref}
        className={cn(
          "fixed inset-x-0 bottom-0 z-50 mt-24 flex flex-col rounded-t-[10px] border bg-background min-h-fit",
          className,
        )}
        style={{
          maxHeight: contentHeight ? `${contentHeight + 24}px` : undefined,
          height: "auto",
        }}
        {...props}
      >
        <div className="mx-auto mt-4 h-2 w-[100px] rounded-full bg-muted" />
        <div ref={contentRef} className="overflow-visible">
          {children}
        </div>
      </DrawerPrimitive.Content>
    </DrawerPortal>
  )
})
DrawerContent.displayName = "DrawerContent"

const DrawerHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("grid gap-1.5 p-4 text-center sm:text-left", className)} {...props} />
)
DrawerHeader.displayName = "DrawerHeader"

const DrawerFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("mt-auto flex flex-col gap-2 p-4", className)} {...props} />
)
DrawerFooter.displayName = "DrawerFooter"

const DrawerTitle = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DrawerPrimitive.Title
    ref={ref}
    className={cn("text-lg font-semibold leading-none tracking-tight", className)}
    {...props}
  />
))
DrawerTitle.displayName = DrawerPrimitive.Title.displayName

const DrawerDescription = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DrawerPrimitive.Description ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
))
DrawerDescription.displayName = DrawerPrimitive.Description.displayName

export {
  Drawer,
  DrawerPortal,
  DrawerOverlay,
  DrawerTrigger,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
}

