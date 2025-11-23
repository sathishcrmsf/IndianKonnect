"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowRight, ArrowLeft, Check } from "lucide-react"
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
  const [selectedCity, setSelectedCity] = useState<string | null>(null)

  const handleScreen1Continue = () => {
    setStep(2)
  }

  const handleScreen2Continue = () => {
    if (phoneNumber.length >= 10) {
      setStep(3)
    }
  }

  const handleScreen3Continue = () => {
    if (selectedCity) {
      // Store in localStorage
      localStorage.setItem("onboarding", JSON.stringify({
        phone: `${selectedCountry.code}${phoneNumber}`,
        cityId: selectedCity,
      }))
      router.push("/home")
    }
  }

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
            disabled={phoneNumber.length < 10}
          >
            Continue
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    )
  }

  // Screen 3: City Selection
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
          onClick={handleScreen3Continue}
          disabled={!selectedCity}
        >
          Get Started
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

