"use client"

import { useState } from "react"
import { Map, List, Verified } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatCurrency, formatTimeAgo } from "@/lib/utils"
import { Post } from "@/types"
import Link from "next/link"

// Mock data
const mockPosts: Post[] = [
  {
    id: "1",
    user_id: "1",
    category: "room_rent",
    title: "Room available in Brampton",
    description: "Spacious room available",
    price: 650,
    currency: "CAD",
    images: [],
    city_id: "2",
    veg_only: true,
    gender_filter: "both",
    is_anonymous: false,
    is_premium: true,
    is_verified_owner: true,
    is_active: true,
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  },
]

export default function MapPage() {
  const [viewMode, setViewMode] = useState<"map" | "list">("list")

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-background px-4 py-3">
        <h1 className="text-lg font-bold">Map & List</h1>
        <div className="flex gap-2">
          <Button
            variant={viewMode === "map" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("map")}
          >
            <Map className="mr-2 h-4 w-4" />
            Map
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("list")}
          >
            <List className="mr-2 h-4 w-4" />
            List
          </Button>
        </div>
      </div>

      {viewMode === "map" ? (
        /* Map View */
        <div className="h-[calc(100vh-120px)] w-full">
          {/* Placeholder for Google Maps */}
          <div className="flex h-full items-center justify-center bg-muted">
            <div className="text-center">
              <Map className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <p className="text-muted-foreground">
                Google Maps integration ready
              </p>
              <p className="text-sm text-muted-foreground">
                Add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to enable
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* List View */
        <div className="space-y-1">
          {mockPosts.map((post, index) => {
            const postDate = new Date(post.created_at)
            const prevPostDate = index > 0 ? new Date(mockPosts[index - 1].created_at) : null
            const showDateSeparator = prevPostDate && 
              (postDate.toDateString() !== prevPostDate.toDateString())
            
            return (
              <div key={post.id}>
                {/* Date Separator */}
                {showDateSeparator && (
                  <div className="px-4 py-2 border-b border-border">
                    <span className="text-xs font-medium text-muted-foreground">
                      {postDate.toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </span>
                  </div>
                )}
                
                {/* Post Item */}
                <Link
                  href={`/posts/${post.id}`}
                  className="block px-4 py-4 border-b border-border/50 active:bg-muted/50 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex gap-4">
                    {/* Image */}
                    <div className="h-20 w-20 shrink-0 rounded-lg bg-muted" />

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="mb-1.5 flex items-center gap-2">
                        <h3 className="font-semibold truncate">{post.title}</h3>
                        {post.is_premium && (
                          <Verified className="h-4 w-4 shrink-0 text-blue-500" />
                        )}
                      </div>
                      {post.price !== null && (
                        <p className="mb-2 text-lg font-bold text-saffron">
                          {formatCurrency(post.price, post.currency)}
                        </p>
                      )}
                      <p className="mb-2 text-sm text-muted-foreground line-clamp-2">
                        {post.description}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-muted-foreground">
                          {formatTimeAgo(postDate)}
                        </span>
                        <span className="text-xs text-muted-foreground/70">
                          • {postDate.toLocaleTimeString('en-US', { 
                            hour: 'numeric', 
                            minute: '2-digit',
                            hour12: true 
                          })}
                        </span>
                        <Button
                          size="sm"
                          className="h-6 text-xs ml-auto"
                          onClick={(e) => {
                            e.preventDefault()
                            const phone = "1234567890"
                            window.open(`https://wa.me/${phone}`, "_blank")
                          }}
                        >
                          Chat
                        </Button>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

