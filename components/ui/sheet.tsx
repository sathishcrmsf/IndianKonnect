"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface SheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
  side?: "top" | "bottom" | "left" | "right"
}

export function Sheet({ open, onOpenChange, children, side = "bottom" }: SheetProps) {
  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [open])

  if (!open) return null

  const sideClasses = {
    bottom: "bottom-0 left-0 right-0 rounded-t-2xl",
    top: "top-0 left-0 right-0 rounded-b-2xl",
    left: "left-0 top-0 bottom-0 rounded-r-2xl",
    right: "right-0 top-0 bottom-0 rounded-l-2xl",
  }

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/50"
        onClick={() => onOpenChange(false)}
      />
      <div
        className={cn(
          "fixed z-50 bg-background shadow-lg",
          sideClasses[side]
        )}
      >
        {children}
      </div>
    </>
  )
}

