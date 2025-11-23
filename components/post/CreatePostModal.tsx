"use client"

import { useState } from "react"
import { Dialog } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X, Upload, Check } from "lucide-react"
import { PostCategory } from "@/types"

const categories: { id: PostCategory; label: string; emoji: string }[] = [
  { id: "room_rent", label: "Room / PG for Rent", emoji: "🏠" },
  { id: "need_room", label: "Need Room / Roommate", emoji: "🔑" },
  { id: "ride_share", label: "Ride Share", emoji: "🚗" },
  { id: "deals", label: "Grocery / Restaurant Deals", emoji: "🛒" },
  { id: "parcel", label: "Parcel from India", emoji: "📦" },
  { id: "job", label: "Job / Referral", emoji: "💼" },
  { id: "buy_sell", label: "Buy & Sell", emoji: "💰" },
  { id: "help", label: "Help / Advice", emoji: "🤝" },
]

interface CreatePostModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit?: (data: any) => void
}

export function CreatePostModal({
  open,
  onOpenChange,
  onSubmit,
}: CreatePostModalProps) {
  const [selectedCategory, setSelectedCategory] = useState<PostCategory | null>(
    null
  )
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState("")
  const [images, setImages] = useState<string[]>([])
  const [vegOnly, setVegOnly] = useState(false)
  const [genderFilter, setGenderFilter] = useState<"male" | "female" | "both">("both")
  const [isAnonymous, setIsAnonymous] = useState(false)

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && images.length < 4) {
      // In real app, upload to Supabase storage
      const newImages = Array.from(files).slice(0, 4 - images.length)
      setImages([...images, ...newImages.map(() => URL.createObjectURL(newImages[0]))])
    }
  }

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index))
  }

  const handleSubmit = () => {
    if (!selectedCategory || !title || !description) return

    const postData = {
      category: selectedCategory,
      title,
      description,
      price: price ? parseFloat(price) : 0,
      images,
      vegOnly,
      genderFilter,
      isAnonymous,
    }

    onSubmit?.(postData)
    onOpenChange(false)
    // Reset form
    setSelectedCategory(null)
    setTitle("")
    setDescription("")
    setPrice("")
    setImages([])
    setVegOnly(false)
    setGenderFilter("both")
    setIsAnonymous(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <div className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">Create Post</h2>
          <button onClick={() => onOpenChange(false)}>
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Category Picker */}
        <div className="mb-4">
          <label className="mb-2 block text-sm font-medium">Category</label>
          <div className="grid grid-cols-2 gap-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-2 rounded-lg border p-3 text-left ${
                  selectedCategory === cat.id
                    ? "border-whatsapp-green bg-whatsapp-green/10"
                    : "border-border"
                }`}
              >
                <span className="text-xl">{cat.emoji}</span>
                <span className="text-sm">{cat.label}</span>
                {selectedCategory === cat.id && (
                  <Check className="ml-auto h-4 w-4 text-whatsapp-green" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Photo Upload */}
        <div className="mb-4">
          <label className="mb-2 block text-sm font-medium">Photos (max 4)</label>
          <div className="flex gap-2">
            {images.map((img, idx) => (
              <div key={idx} className="relative h-20 w-20 rounded-lg overflow-hidden">
                <img src={img} alt={`Upload ${idx + 1}`} className="h-full w-full object-cover" />
                <button
                  onClick={() => removeImage(idx)}
                  className="absolute right-1 top-1 rounded-full bg-black/50 p-1"
                >
                  <X className="h-3 w-3 text-white" />
                </button>
              </div>
            ))}
            {images.length < 4 && (
              <label className="flex h-20 w-20 cursor-pointer items-center justify-center rounded-lg border border-dashed border-border">
                <Upload className="h-5 w-5" />
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleImageUpload}
                />
              </label>
            )}
          </div>
        </div>

        {/* Title */}
        <div className="mb-4">
          <Input
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        {/* Description */}
        <div className="mb-4">
          <textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          />
        </div>

        {/* Price */}
        <div className="mb-4">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              ₹
            </span>
            <Input
              type="number"
              placeholder="Price"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>

        {/* Veg/Non-veg Toggle */}
        <div className="mb-4 flex items-center justify-between rounded-lg border border-border p-3">
          <span className="text-sm">Veg only</span>
          <button
            onClick={() => setVegOnly(!vegOnly)}
            className={`h-6 w-11 rounded-full transition-colors ${
              vegOnly ? "bg-whatsapp-green" : "bg-muted"
            }`}
          >
            <div
              className={`h-5 w-5 rounded-full bg-white transition-transform ${
                vegOnly ? "translate-x-5" : "translate-x-0.5"
              }`}
            />
          </button>
        </div>

        {/* Gender Filter */}
        <div className="mb-4">
          <label className="mb-2 block text-sm font-medium">Gender</label>
          <div className="flex gap-2">
            {(["both", "male", "female"] as const).map((gender) => (
              <button
                key={gender}
                onClick={() => setGenderFilter(gender)}
                className={`flex-1 rounded-lg border p-2 text-sm ${
                  genderFilter === gender
                    ? "border-whatsapp-green bg-whatsapp-green/10"
                    : "border-border"
                }`}
              >
                {gender === "both" ? "Both" : gender === "male" ? "Male" : "Female"}
              </button>
            ))}
          </div>
        </div>

        {/* Anonymous Toggle */}
        <div className="mb-6 flex items-center justify-between rounded-lg border border-border p-3">
          <span className="text-sm">Post anonymously</span>
          <button
            onClick={() => setIsAnonymous(!isAnonymous)}
            className={`h-6 w-11 rounded-full transition-colors ${
              isAnonymous ? "bg-whatsapp-green" : "bg-muted"
            }`}
          >
            <div
              className={`h-5 w-5 rounded-full bg-white transition-transform ${
                isAnonymous ? "translate-x-5" : "translate-x-0.5"
              }`}
            />
          </button>
        </div>

        {/* Submit Button */}
        <Button
          className="w-full h-12 text-base font-semibold"
          onClick={handleSubmit}
          disabled={!selectedCategory || !title || !description}
        >
          Share to IndianKonnect
        </Button>
      </div>
    </Dialog>
  )
}

