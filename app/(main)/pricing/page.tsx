"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Check, Verified, Zap, Share2, MessageCircle, Trophy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import { formatCurrency } from "@/lib/utils"

const benefits = [
  {
    icon: Verified,
    title: "Verified Blue Tick",
    description: "Get the verified badge on all your posts",
  },
  {
    icon: Zap,
    title: "Priority Listing",
    description: "Your posts stay on top for 72 hours",
  },
  {
    icon: Share2,
    title: "Auto-Share to Groups",
    description: "Auto-share to 10 major city WhatsApp groups",
  },
  {
    icon: MessageCircle,
    title: "Direct WhatsApp Chat",
    description: "Chat without saving phone numbers",
  },
  {
    icon: Trophy,
    title: "Success Badge",
    description: "Show 'Helped X people' badge on profile",
  },
]

// Mock countdown - in production, calculate from database
const TOTAL_SPOTS = 500
const TAKEN_SPOTS = 113 // Mock: 113 already taken
const REMAINING_SPOTS = TOTAL_SPOTS - TAKEN_SPOTS

export default function PricingPage() {
  const router = useRouter()
  const [selectedPlan, setSelectedPlan] = useState<"india" | "international">("india")
  const [loading, setLoading] = useState(false)
  const [countdown, setCountdown] = useState(REMAINING_SPOTS)

  // Update countdown (mock - in production, fetch from database)
  useEffect(() => {
    // Simulate countdown decreasing (for demo purposes)
    const interval = setInterval(() => {
      setCountdown((prev) => Math.max(0, prev - Math.random() * 0.1))
    }, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [])

  // Detect user location (mock - in production, use IP geolocation)
  useEffect(() => {
    // Simple check: if phone starts with +91, show India pricing
    // Otherwise show international
    // For now, default to India
    setSelectedPlan("india")
  }, [])

  const handlePayment = async () => {
    setLoading(true)
    try {
      // Get user phone from localStorage or session
      const userPhone = localStorage.getItem("userPhone") || "+1234567890" // Mock

      const response = await fetch("/api/payments/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan: selectedPlan,
          amount: selectedPlan === "india" ? 299 : 19,
          currency: selectedPlan === "india" ? "INR" : "USD",
        }),
      })

      const data = await response.json()

      if (data.success) {
        if (selectedPlan === "india") {
          // Razorpay
          if (data.razorpayOrderId) {
            // Load Razorpay script and open checkout
            const script = document.createElement("script")
            script.src = "https://checkout.razorpay.com/v1/checkout.js"
            script.onload = () => {
              const Razorpay = (window as any).Razorpay
              const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "",
                amount: data.amount,
                currency: data.currency,
                name: "IndianKonnect",
                description: "Lifetime Premium Membership",
                order_id: data.razorpayOrderId,
                handler: async (response: any) => {
                  // Verify payment
                  const verifyResponse = await fetch("/api/payments/verify", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      paymentId: response.razorpay_payment_id,
                      orderId: response.razorpay_order_id,
                      signature: response.razorpay_signature,
                      provider: "razorpay",
                      userPhone,
                    }),
                  })

                  const verifyData = await verifyResponse.json()
                  if (verifyData.success) {
                    localStorage.setItem("justUpgraded", "true")
                    router.push("/profile?upgraded=true")
                  } else {
                    alert("Payment verification failed. Please contact support.")
                  }
                },
                prefill: {
                  contact: userPhone,
                },
                theme: {
                  color: "#25D366",
                },
              }

              const razorpay = new Razorpay(options)
              razorpay.on("payment.failed", (response: any) => {
                alert(`Payment failed: ${response.error.description}`)
                setLoading(false)
              })
              razorpay.open()
            }
            document.body.appendChild(script)
          }
        } else {
          // Stripe - redirect to checkout page
          if (data.clientSecret) {
            // For now, show message (in production, integrate Stripe Checkout)
            alert(
              "Stripe integration: Redirecting to payment... (In production, this will open Stripe Checkout)"
            )
            // In production: window.location.href = `/api/payments/stripe-checkout?client_secret=${data.clientSecret}`
          }
        }
      } else {
        alert("Failed to create payment. Please try again.")
      }
    } catch (error) {
      console.error("Payment error:", error)
      alert("An error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center gap-3 border-b border-border bg-background px-4 py-3">
        <button onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="flex-1 text-lg font-bold">Upgrade to Lifetime</h1>
      </div>

      <div className="px-4 py-6">
        {/* Countdown Banner */}
        <div className="mb-6 rounded-lg border border-saffron bg-gradient-to-r from-saffron/20 to-whatsapp-green/20 p-4 text-center">
          <p className="text-sm font-semibold text-saffron">
            ⚡ Limited Time Offer
          </p>
          <p className="mt-1 text-lg font-bold">
            Only {countdown} spots left at founder price!
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {TAKEN_SPOTS} founders already joined
          </p>
        </div>

        {/* Plan Selector */}
        <div className="mb-6">
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setSelectedPlan("india")}
              className={`rounded-lg border p-4 text-left ${
                selectedPlan === "india"
                  ? "border-whatsapp-green bg-whatsapp-green/10"
                  : "border-border"
              }`}
            >
              <div className="mb-2 flex items-center gap-2">
                <span className="text-2xl">🇮🇳</span>
                <span className="font-semibold">India</span>
              </div>
              <p className="text-2xl font-bold text-saffron">₹299</p>
              <p className="text-xs text-muted-foreground">One-time payment</p>
            </button>

            <button
              onClick={() => setSelectedPlan("international")}
              className={`rounded-lg border p-4 text-left ${
                selectedPlan === "international"
                  ? "border-whatsapp-green bg-whatsapp-green/10"
                  : "border-border"
              }`}
            >
              <div className="mb-2 flex items-center gap-2">
                <span className="text-2xl">🌍</span>
                <span className="font-semibold">International</span>
              </div>
              <p className="text-2xl font-bold text-saffron">$19</p>
              <p className="text-xs text-muted-foreground">One-time payment</p>
            </button>
          </div>
        </div>

        {/* Benefits List */}
        <div className="mb-6">
          <h2 className="mb-4 text-xl font-bold">What You Get:</h2>
          <div className="space-y-3">
            {benefits.map((benefit, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 rounded-lg border border-border bg-muted/30 p-3"
              >
                <div className="rounded-full bg-whatsapp-green/20 p-2">
                  <benefit.icon className="h-5 w-5 text-whatsapp-green" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">{benefit.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {benefit.description}
                  </p>
                </div>
                <Check className="h-5 w-5 shrink-0 text-whatsapp-green" />
              </div>
            ))}
          </div>
        </div>

        {/* Payment Button */}
        <Button
          className="w-full h-14 text-lg font-semibold"
          onClick={handlePayment}
          disabled={loading}
        >
          {loading
            ? "Processing..."
            : `Upgrade Now - ${selectedPlan === "india" ? "₹299" : "$19"}`}
        </Button>

        {/* Trust Badges */}
        <div className="mt-6 text-center">
          <p className="text-xs text-muted-foreground">
            🔒 Secure payment via{" "}
            {selectedPlan === "india" ? "Razorpay" : "Stripe"}
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            ✅ Lifetime access • No recurring charges • Cancel anytime
          </p>
        </div>

        {/* FAQ Section */}
        <div className="mt-8">
          <h3 className="mb-4 text-lg font-semibold">Frequently Asked</h3>
          <div className="space-y-3 text-sm">
            <div className="rounded-lg border border-border p-3">
              <p className="font-semibold">Is this really lifetime?</p>
              <p className="mt-1 text-muted-foreground">
                Yes! One payment, lifetime access. No recurring charges ever.
              </p>
            </div>
            <div className="rounded-lg border border-border p-3">
              <p className="font-semibold">What happens after 500 spots?</p>
              <p className="mt-1 text-muted-foreground">
                Price increases to ₹999 / $49. Get it now at founder price!
              </p>
            </div>
            <div className="rounded-lg border border-border p-3">
              <p className="font-semibold">Can I get a refund?</p>
              <p className="mt-1 text-muted-foreground">
                Yes, within 7 days if not satisfied. Contact support.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

