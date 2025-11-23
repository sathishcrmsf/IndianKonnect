"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Share2, Check, ArrowRight, Users, Shield, Zap } from "lucide-react"
import Link from "next/link"

export default function LaunchPage() {
  const [memberCount, setMemberCount] = useState(200)
  const [spotsLeft, setSpotsLeft] = useState(300)

  useEffect(() => {
    // Fetch real member count from API
    fetch("/api/stats/members")
      .then((res) => res.json())
      .then((data) => {
        if (data.count) {
          setMemberCount(data.count)
          setSpotsLeft(500 - data.count)
        }
      })
      .catch(() => {
        // Use default values if API fails
      })
  }, [])

  const handleShare = async () => {
    const message = `🔥 *IndianKonnect.com is finally here!*  

No more scrolling 1000 messages in WhatsApp groups!  

One app for:  
✅ Room / PG (with price comparison)  
✅ Ride shares  
✅ Grocery & restaurant deals  
✅ Parcel from India  
✅ Jobs & referrals  

100% safe — verified users only  
Post in 5 seconds → reaches thousands instantly  

👉 Join free: ${window.location.origin}  

First 500 lifetime members get it for just ₹299 / $19 forever!  
(Already ${memberCount}+ joined in 2 hours)

Forward to your city group and help everyone! 🇮🇳`

    if (navigator.share) {
      try {
        await navigator.share({
          title: "IndianKonnect - One safe place for Indians abroad",
          text: message,
          url: window.location.origin,
        })
      } catch (err) {
        // User cancelled or error
        copyToClipboard(message)
      }
    } else {
      copyToClipboard(message)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    alert("Launch message copied to clipboard! Share it on WhatsApp!")
  }

  const handleWhatsAppShare = () => {
    const message = encodeURIComponent(
      `🔥 *IndianKonnect.com is finally here!*  

No more scrolling 1000 messages in WhatsApp groups!  

One app for:  
✅ Room / PG (with price comparison)  
✅ Ride shares  
✅ Grocery & restaurant deals  
✅ Parcel from India  
✅ Jobs & referrals  

100% safe — verified users only  
Post in 5 seconds → reaches thousands instantly  

👉 Join free: ${window.location.origin}  

First 500 lifetime members get it for just ₹299 / $19 forever!  
(Already ${memberCount}+ joined in 2 hours)

Forward to your city group and help everyone! 🇮🇳`
    )
    window.open(`https://wa.me/?text=${message}`, "_blank")
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-whatsapp-green/10">
      {/* Hero Section */}
      <div className="px-4 py-12 text-center">
        <div className="mb-6">
          <Badge className="mb-4 bg-saffron text-white">
            🎉 Now Live!
          </Badge>
          <h1 className="mb-4 text-4xl font-bold text-white md:text-5xl">
            IndianKonnect.com is finally here!
          </h1>
          <p className="text-xl text-white/90 md:text-2xl">
            No more scrolling 1000 messages in WhatsApp groups!
          </p>
        </div>

        {/* Features Grid */}
        <div className="mx-auto mb-8 max-w-md space-y-3 text-left">
          <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 p-3">
            <Check className="h-5 w-5 shrink-0 text-whatsapp-green" />
            <span>Room / PG (with price comparison)</span>
          </div>
          <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 p-3">
            <Check className="h-5 w-5 shrink-0 text-whatsapp-green" />
            <span>Ride shares</span>
          </div>
          <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 p-3">
            <Check className="h-5 w-5 shrink-0 text-whatsapp-green" />
            <span>Grocery & restaurant deals</span>
          </div>
          <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 p-3">
            <Check className="h-5 w-5 shrink-0 text-whatsapp-green" />
            <span>Parcel from India</span>
          </div>
          <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 p-3">
            <Check className="h-5 w-5 shrink-0 text-whatsapp-green" />
            <span>Jobs & referrals</span>
          </div>
        </div>

        {/* Key Benefits */}
        <div className="mx-auto mb-8 max-w-md space-y-4">
          <div className="flex items-center justify-center gap-2 rounded-lg border border-whatsapp-green/50 bg-whatsapp-green/10 p-3">
            <Shield className="h-5 w-5 text-whatsapp-green" />
            <span className="font-semibold">100% safe — verified users only</span>
          </div>
          <div className="flex items-center justify-center gap-2 rounded-lg border border-saffron/50 bg-saffron/10 p-3">
            <Zap className="h-5 w-5 text-saffron" />
            <span className="font-semibold">Post in 5 seconds → reaches thousands instantly</span>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="mx-auto mb-8 max-w-md space-y-3">
          <Link href="/onboarding" className="block">
            <Button className="w-full h-14 text-lg font-semibold">
              Join Free Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>

          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              className="w-full"
              onClick={handleWhatsAppShare}
            >
              <Share2 className="mr-2 h-4 w-4" />
              Share on WhatsApp
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={handleShare}
            >
              <Share2 className="mr-2 h-4 w-4" />
              Share
            </Button>
          </div>
        </div>

        {/* Founder Deal */}
        <div className="mx-auto max-w-md rounded-lg border border-saffron bg-gradient-to-r from-saffron/20 to-whatsapp-green/20 p-6">
          <h3 className="mb-2 text-lg font-bold text-saffron">
            First 500 Lifetime Members
          </h3>
          <p className="mb-4 text-2xl font-bold">
            Just ₹299 / $19 forever!
          </p>
          <div className="mb-4 flex items-center justify-center gap-2">
            <Users className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Already {memberCount}+ joined in 2 hours
            </span>
          </div>
          <p className="mb-4 text-sm font-semibold text-saffron">
            Only {spotsLeft} spots left at founder price!
          </p>
          <Link href="/pricing">
            <Button className="w-full bg-saffron text-white hover:bg-saffron/90">
              Claim Your Spot
            </Button>
          </Link>
        </div>

        {/* Call to Action */}
        <div className="mx-auto mt-8 max-w-md text-center">
          <p className="mb-4 text-lg font-semibold">
            Forward to your city group and help everyone! 🇮🇳
          </p>
          <Link href="/onboarding">
            <Button variant="outline" className="w-full">
              Get Started Free
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

