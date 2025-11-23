"use client"

import { useState } from "react"
import { MessageCircle } from "lucide-react"
import Link from "next/link"
import { formatTimeAgo } from "@/lib/utils"

// Mock chat data
const mockChats: Array<{
  id: string
  post_id: string
  sender_name: string
  last_message: string
  last_message_time: Date
  unread_count: number
}> = []

export default function ChatsPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-border bg-background px-4 py-3">
        <h1 className="text-lg font-bold">Chats</h1>
      </div>

      {/* Chats List */}
      <div className="divide-y divide-border">
        {mockChats.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <MessageCircle className="mb-4 h-12 w-12 text-muted-foreground" />
            <p className="text-muted-foreground">No chats yet</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Start a conversation from a post
            </p>
          </div>
        ) : (
          mockChats.map((chat) => (
            <Link
              key={chat.id}
              href={`/chats/${chat.id}`}
              className="block px-4 py-3 active:bg-muted/50"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-whatsapp-green to-saffron text-2xl">
                  🇮🇳
                </div>
                <div className="flex-1 min-w-0">
                  <div className="mb-1 flex items-center justify-between">
                    <span className="font-medium truncate">{chat.sender_name}</span>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {formatTimeAgo(chat.last_message_time)}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {chat.last_message}
                  </p>
                  {chat.unread_count > 0 && (
                    <div className="mt-1 flex justify-end">
                      <span className="rounded-full bg-whatsapp-green px-2 py-0.5 text-xs text-white">
                        {chat.unread_count}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  )
}

