"use client"

import { Sheet } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import { FilterState, PostCategory } from "@/types"

const categoryLabels: Record<PostCategory, string> = {
  room_rent: "Rooms",
  need_room: "Rooms",
  ride_share: "Rides",
  deals: "Deals",
  parcel: "Parcels",
  job: "Jobs",
  buy_sell: "Buy & Sell",
  help: "Help",
}

interface FilterSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  filters: FilterState
  onFiltersChange: (filters: FilterState) => void
  onApply: () => void
  onReset: () => void
}

export function FilterSheet({
  open,
  onOpenChange,
  filters,
  onFiltersChange,
  onApply,
  onReset,
}: FilterSheetProps) {
  const toggleCategory = (category: PostCategory) => {
    const newCategories = filters.categories.includes(category)
      ? filters.categories.filter((c) => c !== category)
      : [...filters.categories, category]
    onFiltersChange({ ...filters, categories: newCategories })
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange} side="bottom">
      <div className="max-h-[80vh] overflow-y-auto p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">Filters</h2>
          <button onClick={() => onOpenChange(false)}>
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Categories */}
        <div className="mb-6">
          <label className="mb-2 block text-sm font-medium">Categories</label>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(categoryLabels) as PostCategory[]).map((category) => (
              <button
                key={category}
                onClick={() => toggleCategory(category)}
                className={`rounded-full border px-4 py-2 text-sm ${
                  filters.categories.includes(category)
                    ? "border-whatsapp-green bg-whatsapp-green/10 text-whatsapp-green"
                    : "border-border"
                }`}
              >
                {categoryLabels[category]}
              </button>
            ))}
          </div>
        </div>

        {/* Price Range */}
        <div className="mb-6">
          <label className="mb-2 block text-sm font-medium">
            Price Range: ${filters.priceRange[0]} - ${filters.priceRange[1]}
          </label>
          <input
            type="range"
            min="0"
            max="5000"
            value={filters.priceRange[1]}
            onChange={(e) =>
              onFiltersChange({
                ...filters,
                priceRange: [filters.priceRange[0], parseInt(e.target.value)],
              })
            }
            className="w-full"
          />
        </div>

        {/* Veg/Non-veg */}
        <div className="mb-6 flex items-center justify-between rounded-lg border border-border p-3">
          <span className="text-sm">Veg only</span>
          <button
            onClick={() =>
              onFiltersChange({
                ...filters,
                vegOnly: filters.vegOnly === true ? null : true,
              })
            }
            className={`h-6 w-11 rounded-full transition-colors ${
              filters.vegOnly === true ? "bg-whatsapp-green" : "bg-muted"
            }`}
          >
            <div
              className={`h-5 w-5 rounded-full bg-white transition-transform ${
                filters.vegOnly === true ? "translate-x-5" : "translate-x-0.5"
              }`}
            />
          </button>
        </div>

        {/* Gender */}
        <div className="mb-6">
          <label className="mb-2 block text-sm font-medium">Gender</label>
          <div className="flex gap-2">
            {(["both", "male", "female", null] as const).map((gender) => (
              <button
                key={gender || "all"}
                onClick={() => onFiltersChange({ ...filters, gender })}
                className={`flex-1 rounded-lg border p-2 text-sm ${
                  filters.gender === gender
                    ? "border-whatsapp-green bg-whatsapp-green/10"
                    : "border-border"
                }`}
              >
                {gender === null ? "All" : gender === "both" ? "Both" : gender === "male" ? "Male" : "Female"}
              </button>
            ))}
          </div>
        </div>

        {/* Verified Only */}
        <div className="mb-6 flex items-center justify-between rounded-lg border border-border p-3">
          <span className="text-sm">Verified only</span>
          <button
            onClick={() =>
              onFiltersChange({
                ...filters,
                verifiedOnly: !filters.verifiedOnly,
              })
            }
            className={`h-6 w-11 rounded-full transition-colors ${
              filters.verifiedOnly ? "bg-whatsapp-green" : "bg-muted"
            }`}
          >
            <div
              className={`h-5 w-5 rounded-full bg-white transition-transform ${
                filters.verifiedOnly ? "translate-x-5" : "translate-x-0.5"
              }`}
            />
          </button>
        </div>

        {/* Date Filter */}
        <div className="mb-6">
          <label className="mb-2 block text-sm font-medium">Date</label>
          <div className="flex gap-2">
            {(["all", "today", "week"] as const).map((date) => (
              <button
                key={date}
                onClick={() =>
                  onFiltersChange({ ...filters, dateFilter: date })
                }
                className={`flex-1 rounded-lg border p-2 text-sm ${
                  filters.dateFilter === date
                    ? "border-whatsapp-green bg-whatsapp-green/10"
                    : "border-border"
                }`}
              >
                {date === "all" ? "All time" : date === "today" ? "Today" : "This week"}
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={onReset}>
            Reset
          </Button>
          <Button className="flex-1" onClick={onApply}>
            Apply
          </Button>
        </div>
      </div>
    </Sheet>
  )
}

