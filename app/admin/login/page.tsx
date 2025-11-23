"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, Shield } from "lucide-react"

const countries = [
  { code: "+91", name: "India", flag: "🇮🇳" },
  { code: "+1", name: "USA/Canada", flag: "🇺🇸" },
  { code: "+44", name: "UK", flag: "🇬🇧" },
]

export default function AdminLoginPage() {
  const router = useRouter()
  const [selectedCountry, setSelectedCountry] = useState(countries[0])
  const [phoneNumber, setPhoneNumber] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleLogin = async () => {
    if (phoneNumber.length < 10) {
      setError("Please enter a valid phone number")
      return
    }

    setLoading(true)
    setError("")

    try {
      const fullPhone = `${selectedCountry.code}${phoneNumber}`
      
      // Check if user is admin
      const response = await fetch("/api/admin/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber: fullPhone }),
      })

      const data = await response.json()

      if (data.isAdmin) {
        // Store admin session
        localStorage.setItem("adminUser", JSON.stringify(data.user))
        localStorage.setItem("adminToken", data.token)
        router.push("/admin/dashboard")
      } else {
        setError("Access denied. This phone number is not authorized as admin.")
      }
    } catch (error) {
      setError("Failed to verify admin access. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-background via-background to-whatsapp-green/10 px-4">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-whatsapp-green/20">
            <Shield className="h-8 w-8 text-whatsapp-green" />
          </div>
          <h1 className="mb-2 text-2xl font-bold">Admin Login</h1>
          <p className="text-sm text-muted-foreground">
            Enter your admin phone number to access the dashboard
          </p>
        </div>

        {/* Country Selector */}
        <div className="mb-4">
          <label className="mb-2 block text-sm text-muted-foreground">
            Country
          </label>
          <div className="grid grid-cols-3 gap-2">
            {countries.map((country) => (
              <button
                key={country.code}
                onClick={() => setSelectedCountry(country)}
                className={`flex items-center justify-center gap-2 rounded-lg border p-3 ${
                  selectedCountry.code === country.code
                    ? "border-whatsapp-green bg-whatsapp-green/10"
                    : "border-border"
                }`}
              >
                <span className="text-xl">{country.flag}</span>
                <span className="text-sm">{country.code}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Phone Input */}
        <div className="mb-4">
          <label className="mb-2 block text-sm text-muted-foreground">
            Phone Number
          </label>
          <div className="flex gap-2">
            <div className="flex items-center rounded-lg border border-border bg-muted px-4">
              <span className="text-sm">{selectedCountry.code}</span>
            </div>
            <Input
              type="tel"
              placeholder="1234567890"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ""))}
              className="flex-1"
            />
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 rounded-lg border border-red-500/50 bg-red-500/10 p-3 text-sm text-red-500">
            {error}
          </div>
        )}

        {/* Login Button */}
        <Button
          className="w-full h-12"
          onClick={handleLogin}
          disabled={loading || phoneNumber.length < 10}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Verifying...
            </>
          ) : (
            "Login as Admin"
          )}
        </Button>

        {/* Info */}
        <p className="mt-4 text-center text-xs text-muted-foreground">
          Only authorized phone numbers can access the admin dashboard
        </p>
      </div>
    </div>
  )
}

