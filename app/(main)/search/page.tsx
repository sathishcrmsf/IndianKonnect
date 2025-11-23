"use client"

import { useState } from "react"
import { Search as SearchIcon, Filter } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { FilterSheet } from "@/components/filters/FilterSheet"
import { FilterState } from "@/types"
import Link from "next/link"
import { formatTimeAgo, formatCurrency } from "@/lib/utils"
import { Post } from "@/types"

// Mock data
const mockPosts: Post[] = []

const initialFilters: FilterState = {
  categories: [],
  priceRange: [0, 5000],
  vegOnly: null,
  gender: null,
  verifiedOnly: false,
  dateFilter: "all",
}

export default function SearchPage() {
  const [query, setQuery] = useState("")
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [filters, setFilters] = useState<FilterState>(initialFilters)

  const handleApplyFilters = () => {
    setFiltersOpen(false)
    // Apply filters logic
  }

  const handleResetFilters = () => {
    setFilters(initialFilters)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-border bg-background px-4 py-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search posts..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setFiltersOpen(true)}
          >
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Results */}
      <div className="divide-y divide-border">
        {mockPosts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <SearchIcon className="mb-4 h-12 w-12 text-muted-foreground" />
            <p className="text-muted-foreground">No results found</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Try adjusting your search or filters
            </p>
          </div>
        ) : (
          mockPosts.map((post) => (
            <Link
              key={post.id}
              href={`/posts/${post.id}`}
              className="block px-4 py-3 active:bg-muted/50"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-whatsapp-green to-saffron text-2xl">
                  🇮🇳
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{post.title}</p>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {post.description}
                  </p>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {formatTimeAgo(new Date(post.created_at))}
                    </span>
                    <span className="text-xs font-semibold text-saffron">
                      {formatCurrency(post.price, post.currency)}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>

      <FilterSheet
        open={filtersOpen}
        onOpenChange={setFiltersOpen}
        filters={filters}
        onFiltersChange={setFilters}
        onApply={handleApplyFilters}
        onReset={handleResetFilters}
      />
    </div>
  )
}

