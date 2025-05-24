import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { cn } from "../../lib/utils"

const Sheet = DialogPrimitive.Root
const SheetTrigger = DialogPrimitive.Trigger
const SheetClose = DialogPrimitive.Close

const SheetPortal = (props: React.ComponentProps<typeof DialogPrimitive.Portal>) => (
  <DialogPrimitive.Portal {...props} />
)
SheetPortal.displayName = DialogPrimitive.Portal.displayName

const SheetOverlay = React.forwardRef<React.ComponentRef<typeof DialogPrimitive.Overlay>, React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>>(
  ({ className, ...props }, ref) => (
    <DialogPrimitive.Overlay
      ref={ref}
      className={cn(
        "fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-all",
        className
      )}
      {...props}
    />
  )
)
SheetOverlay.displayName = DialogPrimitive.Overlay.displayName

const SheetContent = React.forwardRef<React.ComponentRef<typeof DialogPrimitive.Content>, React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & { side?: "top" | "bottom" | "left" | "right" }>(
  ({ side = "top", className, ...props }, ref) => (
    <SheetPortal>
      <SheetOverlay />
      <DialogPrimitive.Content
        ref={ref}
        className={cn(
          "fixed z-50 scale-100 gap-4 bg-white p-6 shadow-lg transition-all duration-300",
          side === "top" && "inset-x-0 top-0 mx-auto w-full max-w-2xl rounded-b-2xl border-b",
          side === "bottom" && "inset-x-0 bottom-0 mx-auto w-full max-w-2xl rounded-t-2xl border-t",
          side === "left" && "inset-y-0 left-0 h-full w-80 rounded-r-2xl border-r",
          side === "right" && "inset-y-0 right-0 h-full w-80 rounded-l-2xl border-l",
          className
        )}
        {...props}
      />
    </SheetPortal>
  )
)
SheetContent.displayName = DialogPrimitive.Content.displayName

const SheetHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col space-y-2 text-center sm:text-left", className)} {...props} />
)
SheetHeader.displayName = "SheetHeader"

const SheetFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)} {...props} />
)
SheetFooter.displayName = "SheetFooter"

const SheetTitle = React.forwardRef<React.ComponentRef<typeof DialogPrimitive.Title>, React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>>(
  ({ className, ...props }, ref) => (
    <DialogPrimitive.Title ref={ref} className={cn("text-lg font-semibold text-gray-900", className)} {...props} />
  )
)
SheetTitle.displayName = DialogPrimitive.Title.displayName

const SheetDescription = React.forwardRef<React.ComponentRef<typeof DialogPrimitive.Description>, React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>>(
  ({ className, ...props }, ref) => (
    <DialogPrimitive.Description ref={ref} className={cn("text-sm text-gray-500", className)} {...props} />
  )
)
SheetDescription.displayName = DialogPrimitive.Description.displayName

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
} 