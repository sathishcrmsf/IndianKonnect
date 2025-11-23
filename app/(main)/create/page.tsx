"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { CreatePostModal } from "@/components/post/CreatePostModal"

export default function CreatePostPage() {
  const router = useRouter()
  const [open, setOpen] = useState(true)

  const handleSubmit = (data: any) => {
    // In real app, save to Supabase
    console.log("Post data:", data)
    // Generate WhatsApp shareable link
    router.push("/home")
  }

  return (
    <CreatePostModal
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen)
        if (!isOpen) {
          router.push("/home")
        }
      }}
      onSubmit={handleSubmit}
    />
  )
}

