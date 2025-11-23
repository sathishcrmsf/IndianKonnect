"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Share2, Flag, Verified, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Carousel } from "@/components/ui/carousel"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { formatCurrency } from "@/lib/utils"
import { Post } from "@/types"
import { DiyaSpinner } from "@/components/ui/loading"

// Mock data
const mockPost: Post = {
  id: "1",
  user_id: "1",
  category: "room_rent",
  title: "Room available in Brampton",
  description: "Spacious room available in a clean, well-maintained house. Veg only kitchen. Looking for responsible, non-smoking tenants. Close to public transport and shopping centers.",
  price: 650,
  currency: "CAD",
  images: [],
  city_id: "2",
  veg_only: true,
  gender_filter: "female",
  is_anonymous: false,
  is_premium: true,
  is_verified_owner: true,
  is_active: true,
  created_at: new Date().toISOString(),
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
}

export default function PostDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [post, setPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)
  const [showReportDialog, setShowReportDialog] = useState(false)
  const [reportReason, setReportReason] = useState("")
  const [reporting, setReporting] = useState(false)

  useEffect(() => {
    // Fetch post from API
    const fetchPost = async () => {
      if (!params.id) return
      
      try {
        const response = await fetch(`/api/posts/${params.id}`)
        const data = await response.json()
        
        if (data.post) {
          setPost(data.post)
        } else if (data.error) {
          console.error('Error fetching post:', data.error)
          // Post not found or error
        }
      } catch (error) {
        console.error('Error fetching post:', error)
        // Fallback to mock data on error (for development)
        if (process.env.NODE_ENV === 'development') {
          setPost(mockPost)
        }
      } finally {
        setLoading(false)
      }
    }

    fetchPost()
  }, [params.id])

  if (loading) {
    return <DiyaSpinner />
  }

  if (!post) {
    return <div>Post not found</div>
  }

  const handleWhatsAppChat = () => {
    const phone = post.user?.phone?.replace(/\D/g, "") || ""
    window.open(`https://wa.me/${phone}`, "_blank")
  }

  const handleWhatsAppCall = () => {
    const phone = post.user?.phone?.replace(/\D/g, "") || ""
    window.open(`https://wa.me/${phone}?text=Hi!`, "_blank")
  }

  const handleReport = async () => {
    if (!reportReason.trim()) return

    setReporting(true)
    try {
      // Get user ID from localStorage
      const userStr = localStorage.getItem("user")
      const user = userStr ? JSON.parse(userStr) : null

      if (!user) {
        alert("Please login to report posts")
        return
      }

      const response = await fetch(`/api/posts/${post.id}/report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          reason: reportReason,
        }),
      })

      const data = await response.json()
      if (data.success) {
        setShowReportDialog(false)
        setReportReason("")
        if (data.autoHidden) {
          alert("Post reported and automatically hidden due to multiple reports")
        } else {
          alert(`Post reported successfully. ${data.reportCount || 1} report(s) total.`)
        }
      } else {
        alert(data.error || "Failed to report post")
      }
    } catch (error) {
      alert("Failed to report post. Please try again.")
    } finally {
      setReporting(false)
    }
  }

  const handleMarkSuccess = async () => {
    try {
      const userStr = localStorage.getItem("user")
      const user = userStr ? JSON.parse(userStr) : null

      if (!user) {
        alert("Please login to mark deals as successful")
        return
      }

      const response = await fetch(`/api/posts/${post.id}/success`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
        }),
      })

      const data = await response.json()
      if (data.success) {
        alert("Thank you! Success count updated.")
      } else {
        alert(data.error || "Failed to update success count")
      }
    } catch (error) {
      alert("Failed to mark as successful. Please try again.")
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center gap-3 border-b border-border bg-background px-4 py-3">
        <button onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="flex-1 text-lg font-semibold">Post Details</h1>
        <button>
          <Share2 className="h-5 w-5" />
        </button>
      </div>

      <div className="px-4 py-6">
        {/* Forwarded Message Style */}
        <div className="mb-6 rounded-lg bg-muted p-4">
          <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
            <span>➡️</span>
            <span>Forwarded message</span>
          </div>
          <div className="text-sm">{post.description}</div>
        </div>

        {/* Image Carousel */}
        {post.images.length > 0 ? (
          <Carousel className="mb-6 h-64 w-full rounded-lg overflow-hidden">
            {post.images.map((img, idx) => (
              <div key={idx} className="flex-[0_0_100%]">
                <img
                  src={img}
                  alt={`Image ${idx + 1}`}
                  className="h-full w-full object-cover"
                />
              </div>
            ))}
          </Carousel>
        ) : (
          <div className="mb-6 flex h-64 items-center justify-center rounded-lg bg-muted">
            <span className="text-4xl">📷</span>
          </div>
        )}

        {/* Price */}
        {post.price !== null && post.price !== undefined && (
          <div className="mb-4">
            <p className="text-3xl font-bold text-saffron">
              {formatCurrency(post.price, post.currency)}
            </p>
          </div>
        )}

        {/* Title */}
        <h2 className="mb-4 text-xl font-semibold">{post.title}</h2>

        {/* Description */}
        <p className="mb-6 text-muted-foreground">{post.description}</p>

        {/* Tags */}
        <div className="mb-6 flex flex-wrap gap-2">
          {post.veg_only && (
            <Badge variant="outline">Veg</Badge>
          )}
          {post.gender_filter !== "both" && (
            <Badge variant="outline">
              {post.gender_filter === "male" ? "Male" : "Female"}
            </Badge>
          )}
          {post.is_verified_owner && (
            <Badge variant="outline" className="flex items-center gap-1">
              <Verified className="h-3 w-3" />
              Verified Owner
            </Badge>
          )}
        </div>

        {/* WhatsApp Buttons */}
        <div className="mb-6 space-y-3">
          <Button
            className="w-full h-12 text-base font-semibold"
            onClick={handleWhatsAppChat}
          >
            Chat on WhatsApp
          </Button>
          <Button
            className="w-full h-12 text-base font-semibold"
            variant="outline"
            onClick={handleWhatsAppCall}
          >
            Call on WhatsApp
          </Button>
        </div>

        {/* Success Button */}
        <div className="mb-4">
          <Button
            variant="outline"
            className="w-full"
            onClick={handleMarkSuccess}
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            Mark as Successful Deal
          </Button>
        </div>

        {/* Bottom Actions */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => setShowReportDialog(true)}
          >
            <Flag className="mr-2 h-4 w-4" />
            Report Scam
          </Button>
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => {
              const shareText = `Check out this post on IndianKonnect:

${post.title}${post.price ? ` - ${formatCurrency(post.price, post.currency)}` : ""}

${post.description}

View details: ${window.location.href}

Join IndianKonnect - One safe place for Indians abroad! 🇮🇳`

              if (navigator.share) {
                navigator.share({
                  title: post.title,
                  text: shareText,
                  url: window.location.href,
                })
              } else {
                // Share to WhatsApp
                const encodedText = encodeURIComponent(shareText)
                window.open(`https://wa.me/?text=${encodedText}`, "_blank")
              }
            }}
          >
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </Button>
        </div>

        {/* Report Dialog */}
        <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Report Post</DialogTitle>
              <DialogDescription>
                Help us keep IndianKonnect safe. Posts with 3+ reports are automatically hidden.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <label className="mb-2 block text-sm font-medium">
                Reason for reporting
              </label>
              <textarea
                className="w-full rounded-lg border border-border bg-background p-3"
                rows={4}
                placeholder="e.g., Scam, Fake listing, Spam, Inappropriate content..."
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
              />
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowReportDialog(false)
                  setReportReason("")
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleReport}
                disabled={!reportReason.trim() || reporting}
              >
                {reporting ? "Reporting..." : "Submit Report"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

