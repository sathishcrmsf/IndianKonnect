"use client"

import { useState, useEffect } from "react"
import { Settings, Verified, Trophy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

// Mock user data
const mockUser = {
  id: "1",
  phone: "+1234567890",
  is_premium: false,
  success_count: 23,
  member_number: 127,
}

export default function ProfilePage() {
  const [user, setUser] = useState(mockUser)
  const [countdown, setCountdown] = useState("387 spots left")

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-background px-4 py-3">
        <h1 className="text-lg font-bold">Profile</h1>
        <button>
          <Settings className="h-5 w-5" />
        </button>
      </div>

      <div className="px-4 py-6">
        {/* Profile Header */}
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-whatsapp-green to-saffron text-4xl">
            🇮🇳
          </div>
          <h2 className="mb-2 text-xl font-bold">
            {user.phone}
          </h2>
          {user.is_premium && (
            <Badge variant="success" className="mb-2">
              <Verified className="mr-1 h-3 w-3" />
              Premium Member
            </Badge>
          )}
        </div>

        {/* Founder Member Badge */}
        {user.is_premium && (
          <div className="mb-6 rounded-lg border border-saffron bg-saffron/10 p-4 text-center">
            <p className="text-lg font-bold text-saffron">
              Founder Member #{user.member_number}
            </p>
          </div>
        )}

        {/* Success Counter */}
        <div className="mb-6 rounded-lg border border-border bg-muted/50 p-4">
          <div className="flex items-center justify-center gap-2">
            <Trophy className="h-5 w-5 text-saffron" />
            <span className="text-lg font-semibold">
              Helped {user.success_count} people
            </span>
          </div>
        </div>

        {/* Upgrade Button */}
        {!user.is_premium && (
          <div className="mb-6 rounded-lg border border-whatsapp-green bg-whatsapp-green/10 p-4">
            <h3 className="mb-2 text-lg font-bold">Upgrade to Lifetime</h3>
            <p className="mb-4 text-sm text-muted-foreground">
              Get verified badge, priority listing, and more
            </p>
            <Button className="w-full mb-2">
              Upgrade Lifetime – ₹299 / $19
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              {countdown} at founder price
            </p>
          </div>
        )}

        {/* User Posts */}
        <div className="mb-6">
          <h3 className="mb-4 text-lg font-semibold">My Posts</h3>
          <div className="rounded-lg border border-border p-4 text-center text-muted-foreground">
            <p>No posts yet</p>
            <Button variant="outline" className="mt-4" asChild>
              <a href="/create">Create your first post</a>
            </Button>
          </div>
        </div>

        {/* Settings */}
        <div className="space-y-2">
          <Button variant="outline" className="w-full justify-start">
            Change City
          </Button>
          <Button variant="outline" className="w-full justify-start">
            Language Settings
          </Button>
          <Button variant="outline" className="w-full justify-start">
            Help & Support
          </Button>
        </div>
      </div>
    </div>
  )
}

