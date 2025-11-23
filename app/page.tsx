"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, Globe } from "lucide-react"
import Link from "next/link"

const cities = [
  { name: "Canada", flag: "🇨🇦" },
  { name: "USA", flag: "🇺🇸" },
  { name: "UK", flag: "🇬🇧" },
  { name: "Australia", flag: "🇦🇺" },
  { name: "Germany", flag: "🇩🇪" },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-whatsapp-green/10">
      {/* Hindi Toggle - Top Right */}
      <div className="absolute top-4 right-4 z-10">
        <button className="rounded-full bg-black/20 p-2 text-white backdrop-blur-sm">
          <Globe className="h-5 w-5" />
        </button>
      </div>

      {/* Hero Section */}
      <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12 text-center">
        <div className="mb-8">
          <h1 className="mb-4 text-4xl font-bold text-white md:text-5xl">
            IndianKonnect
          </h1>
          <p className="text-xl text-white/90 md:text-2xl">
            Rooms • Rides • Deals • Parcels • Jobs
          </p>
          <p className="mt-2 text-lg text-white/80">
            One safe place for Indians abroad
          </p>
        </div>

        {/* Hero Image Placeholder */}
        <div className="mb-8 h-64 w-full max-w-md rounded-2xl bg-gradient-to-br from-whatsapp-green/20 to-saffron/20 p-8 md:h-80">
          <div className="flex h-full items-center justify-center text-6xl">
            👨‍👩‍👧‍👦🏙️
          </div>
        </div>

        {/* WhatsApp Button */}
        <Link href="/onboarding">
          <Button
            size="lg"
            className="mb-8 h-14 w-full max-w-sm text-lg font-semibold shadow-lg"
          >
            Continue with WhatsApp
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </Link>

        {/* Supported Cities */}
        <div className="w-full max-w-md">
          <p className="mb-4 text-sm text-white/70">
            Available in these countries:
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {cities.map((city) => (
              <div
                key={city.name}
                className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-white backdrop-blur-sm"
              >
                <span className="text-xl">{city.flag}</span>
                <span className="text-sm font-medium">{city.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tricolour Divider */}
        <div className="tricolour-divider mt-12 w-full max-w-md" />
      </div>
    </div>
  )
}

