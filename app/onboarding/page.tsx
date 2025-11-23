"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowRight, ArrowLeft, Check, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

const countries = [
  { code: "+91", name: "India", flag: "🇮🇳" },
  { code: "+1", name: "USA/Canada", flag: "🇺🇸" },
  { code: "+44", name: "UK", flag: "🇬🇧" },
  { code: "+61", name: "Australia", flag: "🇦🇺" },
  { code: "+49", name: "Germany", flag: "🇩🇪" },
]

const cities = [
  { id: "1", name: "Toronto", country: "🇨🇦", code: "CA" },
  { id: "2", name: "Brampton", country: "🇨🇦", code: "CA" },
  { id: "3", name: "New Jersey", country: "🇺🇸", code: "US" },
  { id: "4", name: "New York", country: "🇺🇸", code: "US" },
  { id: "5", name: "London", country: "🇬🇧", code: "GB" },
  { id: "6", name: "Sydney", country: "🇦🇺", code: "AU" },
  { id: "7", name: "Melbourne", country: "🇦🇺", code: "AU" },
  { id: "8", name: "Berlin", country: "🇩🇪", code: "DE" },
]

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [selectedCountry, setSelectedCountry] = useState(countries[0])
  const [phoneNumber, setPhoneNumber] = useState("")
  const [otp, setOtp] = useState("")
  const [otpSent, setOtpSent] = useState(false)
  const [otpLoading, setOtpLoading] = useState(false)
  const [verifyLoading, setVerifyLoading] = useState(false)
  const [selectedCity, setSelectedCity] = useState<string | null>(null)
  const [countdown, setCountdown] = useState(0)

  const handleScreen1Continue = () => {
    setStep(2)
  }

  const handleScreen2Continue = async () => {
    if (phoneNumber.length >= 10) {
      setOtpLoading(true)
      try {
        const fullPhone = `${selectedCountry.code}${phoneNumber}`
        const response = await fetch("/api/auth/send-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phoneNumber: fullPhone }),
        })

        const data = await response.json()
        if (data.success) {
          setOtpSent(true)
          setStep(3)
          setCountdown(60) // 60 second countdown
          // In development, show OTP
          if (data.otp) {
            alert(`[DEV] Your OTP is: ${data.otp}`)
          }
        } else {
          alert(data.error || "Failed to send OTP")
        }
      } catch (error) {
        alert("Failed to send OTP. Please try again.")
      } finally {
        setOtpLoading(false)
      }
    }
  }

  const handleResendOTP = async () => {
    if (countdown > 0) return
    setOtpLoading(true)
    try {
      const fullPhone = `${selectedCountry.code}${phoneNumber}`
      const response = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber: fullPhone }),
      })

      const data = await response.json()
      if (data.success) {
        setCountdown(60)
        if (data.otp) {
          alert(`[DEV] Your OTP is: ${data.otp}`)
        }
      }
    } catch (error) {
      alert("Failed to resend OTP")
    } finally {
      setOtpLoading(false)
    }
  }

  const handleVerifyOTP = async () => {
    const trimmedOtp = otp.trim()
    if (trimmedOtp.length !== 6) return

    setVerifyLoading(true)
    try {
      const fullPhone = `${selectedCountry.code}${phoneNumber}`
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phoneNumber: fullPhone,
          otp: trimmedOtp,
        }),
      })

      const data = await response.json()
      if (data.success) {
        // Store user data
        localStorage.setItem("user", JSON.stringify(data.user))
        localStorage.setItem("authToken", data.token)
        setStep(4) // Move to city selection
      } else {
        alert(data.error || "Invalid OTP")
      }
    } catch (error) {
      alert("Failed to verify OTP. Please try again.")
    } finally {
      setVerifyLoading(false)
    }
  }

  const handleScreen4Continue = () => {
    if (selectedCity) {
      // Update user city
      const fullPhone = `${selectedCountry.code}${phoneNumber}`
      fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phoneNumber: fullPhone,
          otp: "verified", // Already verified
          cityId: selectedCity,
        }),
      })

      router.push("/home")
    }
  }

  // Countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setInterval(() => {
        setCountdown((prev) => prev - 1)
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [countdown])

  // Screen 1: Hero
  if (step === 1) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-background via-background to-whatsapp-green/10 px-4">
        <div className="mb-8 h-64 w-full max-w-md rounded-2xl bg-gradient-to-br from-whatsapp-green/20 to-saffron/20 p-8 md:h-80">
          <div className="flex h-full items-center justify-center text-6xl">
            👨‍👩‍👧‍👦🏙️
          </div>
        </div>
        <Button
          size="lg"
          className="h-14 w-full max-w-sm text-lg font-semibold"
          onClick={handleScreen1Continue}
        >
          Continue with WhatsApp
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
    )
  }

  // Screen 2: Phone Number
  if (step === 2) {
    return (
      <div className="flex min-h-screen flex-col px-4 py-12">
        <h1 className="mb-8 text-2xl font-bold">Enter your phone number</h1>
        
        <div className="mb-6">
          <label className="mb-2 block text-sm text-muted-foreground">
            Country
          </label>
          <div className="grid grid-cols-2 gap-2">
            {countries.map((country) => (
              <button
                key={country.code}
                onClick={() => setSelectedCountry(country)}
                className={`flex items-center gap-2 rounded-lg border p-3 ${
                  selectedCountry.code === country.code
                    ? "border-whatsapp-green bg-whatsapp-green/10"
                    : "border-border"
                }`}
              >
                <span className="text-xl">{country.flag}</span>
                <span className="text-sm">{country.code}</span>
                {selectedCountry.code === country.code && (
                  <Check className="ml-auto h-4 w-4 text-whatsapp-green" />
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-6">
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

        <div className="mt-auto flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => setStep(1)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Button
            className="flex-1"
            onClick={handleScreen2Continue}
            disabled={phoneNumber.length < 10 || otpLoading}
          >
            {otpLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                Send OTP
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    )
  }

  // Screen 3: OTP Verification
  if (step === 3) {
    return (
      <div className="flex min-h-screen flex-col px-4 py-12">
        <h1 className="mb-2 text-2xl font-bold">Verify your phone</h1>
        <p className="mb-8 text-sm text-muted-foreground">
          We sent a 6-digit code to {selectedCountry.code}{phoneNumber}
        </p>

        <div className="mb-6">
          <label className="mb-2 block text-sm text-muted-foreground">
            Enter OTP
          </label>
          <Input
            type="text"
            placeholder="123456"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
            className="text-center text-2xl tracking-widest"
            maxLength={6}
            autoFocus
          />
        </div>

        <div className="mb-6 text-center">
          <button
            onClick={handleResendOTP}
            disabled={countdown > 0 || otpLoading}
            className="text-sm text-whatsapp-green disabled:text-muted-foreground"
          >
            {countdown > 0
              ? `Resend OTP in ${countdown}s`
              : "Resend OTP"}
          </button>
        </div>

        <div className="mt-auto flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => setStep(2)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Button
            className="flex-1"
            onClick={handleVerifyOTP}
            disabled={otp.length !== 6 || verifyLoading}
          >
            {verifyLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verifying...
              </>
            ) : (
              <>
                Verify
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    )
  }

  // Screen 4: City Selection
  return (
    <div className="flex min-h-screen flex-col px-4 py-12">
      <h1 className="mb-8 text-2xl font-bold">Choose your city</h1>
      
      <div className="space-y-2">
        {cities.map((city) => (
          <button
            key={city.id}
            onClick={() => setSelectedCity(city.id)}
            className={`flex w-full items-center gap-3 rounded-lg border p-4 text-left ${
              selectedCity === city.id
                ? "border-whatsapp-green bg-whatsapp-green/10"
                : "border-border"
            }`}
          >
            <span className="text-2xl">{city.country}</span>
            <span className="flex-1 font-medium">{city.name}</span>
            {selectedCity === city.id && (
              <Check className="h-5 w-5 text-whatsapp-green" />
            )}
          </button>
        ))}
      </div>

      <div className="mt-auto flex gap-3 pt-6">
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => setStep(2)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button
          className="flex-1"
          onClick={handleScreen4Continue}
          disabled={!selectedCity}
        >
          Get Started
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

