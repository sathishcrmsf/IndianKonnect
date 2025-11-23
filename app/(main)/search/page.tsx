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
      <div className="space-y-1">
        {mockPosts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <SearchIcon className="mb-4 h-12 w-12 text-muted-foreground" />
            <p className="text-muted-foreground">No results found</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Try adjusting your search or filters
            </p>
          </div>
        ) : (
          mockPosts.map((post, index) => {
            const postDate = new Date(post.created_at)
            const prevPostDate = index > 0 ? new Date(mockPosts[index - 1].created_at) : null
            const showDateSeparator = prevPostDate && 
              (postDate.toDateString() !== prevPostDate.toDateString())
            
            return (
              <div key={post.id}>
                {/* Date Separator */}
                {showDateSeparator && (
                  <div className="px-4 py-2 border-b border-border">
                    <span className="text-xs font-medium text-muted-foreground">
                      {postDate.toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </span>
                  </div>
                )}
                
                {/* Post Item */}
                <Link
                  href={`/posts/${post.id}`}
                  className="block px-4 py-4 border-b border-border/50 active:bg-muted/50 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-whatsapp-green to-saffron text-2xl">
                      🇮🇳
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate mb-1.5">{post.title}</p>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                        {post.description}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-muted-foreground">
                          {formatTimeAgo(postDate)}
                        </span>
                        <span className="text-xs text-muted-foreground/70">
                          • {postDate.toLocaleTimeString('en-US', { 
                            hour: 'numeric', 
                            minute: '2-digit',
                            hour12: true 
                          })}
                        </span>
                        {post.price !== null && (
                          <>
                            <span className="text-xs text-muted-foreground/70">•</span>
                            <span className="text-xs font-semibold text-saffron">
                              {formatCurrency(post.price, post.currency)}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            )
          })
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

