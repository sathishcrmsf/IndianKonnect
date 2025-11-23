"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Search, Globe, Verified } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { formatTimeAgo, isNewPost, formatCurrency } from "@/lib/utils"
import { Post } from "@/types"
import { DiyaSpinner } from "@/components/ui/loading"

// Mock data - will be replaced with Supabase queries
const mockPosts: Post[] = [
  {
    id: "1",
    user_id: "1",
    category: "room_rent",
    title: "Room available in Brampton",
    description: "Spacious room available, veg only, 2 spots",
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
    user: {
      id: "1",
      phone: "+1234567890",
      city_id: "2",
      is_premium: true,
      is_verified: true,
      verified_at: new Date().toISOString(),
      success_count: 23,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  },
]

export default function HomePage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [city, setCity] = useState("Brampton")

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setPosts(mockPosts)
      setLoading(false)
    }, 1000)
  }, [])

  return (
    <div className="min-h-screen bg-background">
      {/* Top Bar */}
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-background px-4 py-3">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-bold text-whatsapp-green">
            IndianKonnect
          </h1>
          <button
            onClick={() => {/* Open city selector */}}
            className="text-sm text-muted-foreground"
          >
            {city} ▼
          </button>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/search">
            <Search className="h-5 w-5 text-muted-foreground" />
          </Link>
          <button>
            <Globe className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Posts List */}
      {loading ? (
        <DiyaSpinner />
      ) : (
        <div className="divide-y divide-border">
          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/posts/${post.id}`}
              className="block px-4 py-3 active:bg-muted/50"
            >
              <div className="flex items-start gap-3">
                {/* Profile Pic */}
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-whatsapp-green to-saffron text-2xl">
                  🇮🇳
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium truncate">
                      {post.is_anonymous ? "Anonymous" : post.user?.phone || "User"}
                    </span>
                    {post.is_premium && (
                      <Verified className="h-4 w-4 text-blue-500 shrink-0" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {post.price !== null && `${formatCurrency(post.price, post.currency)} • `}
                    {post.title} •{" "}
                    {post.veg_only ? "Veg only" : "Non-veg"} • {post.description}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-muted-foreground">
                      {formatTimeAgo(new Date(post.created_at))}
                    </span>
                    {isNewPost(new Date(post.created_at)) && (
                      <Badge variant="success" className="text-xs">
                        New
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Floating + Button */}
      <Link href="/create">
        <Button
          size="icon"
          className="fixed bottom-24 right-4 h-14 w-14 rounded-full shadow-lg"
        >
          <Plus className="h-6 w-6" />
        </Button>
      </Link>
    </div>
  )
}

