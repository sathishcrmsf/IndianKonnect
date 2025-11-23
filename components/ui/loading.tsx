"use client"

import { cn } from "@/lib/utils"

export function DiyaSpinner() {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="diya-spinner text-4xl">🪔</div>
    </div>
  )
}

export function LoadingSpinner({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  }

  return (
    <div className="flex items-center justify-center">
      <div
        className={cn(
          "animate-spin rounded-full border-2 border-whatsapp-green border-t-transparent",
          sizeClasses[size]
        )}
      />
    </div>
  )
}

