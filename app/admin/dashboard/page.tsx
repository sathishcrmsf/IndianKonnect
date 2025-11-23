"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { 
  Shield, LogOut, CheckCircle, XCircle, MapPin, DollarSign, 
  Users, FileText, Settings, TrendingUp 
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"

interface DashboardStats {
  totalUsers: number
  totalPosts: number
  pendingPosts: number
  totalRevenue: number
  premiumUsers: number
  activeCities: number
}

export default function AdminDashboardPage() {
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"overview" | "posts" | "cities" | "revenue" | "groups">("overview")

  useEffect(() => {
    // Check admin session
    const adminUser = localStorage.getItem("adminUser")
    if (!adminUser) {
      router.push("/admin/login")
      return
    }

    // Fetch dashboard stats
    fetchStats()
  }, [router])

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/admin/stats")
      const data = await response.json()
      if (data.success) {
        setStats(data.stats)
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("adminUser")
    localStorage.removeItem("adminToken")
    router.push("/admin/login")
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-whatsapp-green border-r-transparent"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-border bg-background px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="h-6 w-6 text-whatsapp-green" />
            <h1 className="text-lg font-bold">Admin Dashboard</h1>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 gap-4 p-4 md:grid-cols-4">
          <div className="rounded-lg border border-border bg-muted/50 p-4">
            <div className="mb-2 flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Total Users</span>
            </div>
            <p className="text-2xl font-bold">{stats.totalUsers}</p>
          </div>

          <div className="rounded-lg border border-border bg-muted/50 p-4">
            <div className="mb-2 flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Total Posts</span>
            </div>
            <p className="text-2xl font-bold">{stats.totalPosts}</p>
            {stats.pendingPosts > 0 && (
              <Badge variant="outline" className="mt-1 text-xs">
                {stats.pendingPosts} pending
              </Badge>
            )}
          </div>

          <div className="rounded-lg border border-border bg-muted/50 p-4">
            <div className="mb-2 flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Revenue</span>
            </div>
            <p className="text-2xl font-bold">₹{stats.totalRevenue.toLocaleString()}</p>
          </div>

          <div className="rounded-lg border border-border bg-muted/50 p-4">
            <div className="mb-2 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Cities</span>
            </div>
            <p className="text-2xl font-bold">{stats.activeCities}</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-border px-4">
        <div className="flex gap-4 overflow-x-auto">
          <button
            onClick={() => setActiveTab("overview")}
            className={`border-b-2 px-4 py-3 text-sm font-medium ${
              activeTab === "overview"
                ? "border-whatsapp-green text-whatsapp-green"
                : "border-transparent text-muted-foreground"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab("posts")}
            className={`border-b-2 px-4 py-3 text-sm font-medium ${
              activeTab === "posts"
                ? "border-whatsapp-green text-whatsapp-green"
                : "border-transparent text-muted-foreground"
            }`}
          >
            Approve Posts
          </button>
          <button
            onClick={() => setActiveTab("cities")}
            className={`border-b-2 px-4 py-3 text-sm font-medium ${
              activeTab === "cities"
                ? "border-whatsapp-green text-whatsapp-green"
                : "border-transparent text-muted-foreground"
            }`}
          >
            Cities
          </button>
          <button
            onClick={() => setActiveTab("revenue")}
            className={`border-b-2 px-4 py-3 text-sm font-medium ${
              activeTab === "revenue"
                ? "border-whatsapp-green text-whatsapp-green"
                : "border-transparent text-muted-foreground"
            }`}
          >
            Revenue
          </button>
          <button
            onClick={() => setActiveTab("groups")}
            className={`border-b-2 px-4 py-3 text-sm font-medium ${
              activeTab === "groups"
                ? "border-whatsapp-green text-whatsapp-green"
                : "border-transparent text-muted-foreground"
            }`}
          >
            Auto-Share Groups
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-4">
        {activeTab === "overview" && <OverviewTab stats={stats} />}
        {activeTab === "posts" && <PostsTab onRefresh={fetchStats} />}
        {activeTab === "cities" && <CitiesTab onRefresh={fetchStats} />}
        {activeTab === "revenue" && <RevenueTab />}
        {activeTab === "groups" && <GroupsTab />}
      </div>
    </div>
  )
}

// Overview Tab Component
function OverviewTab({ stats }: { stats: DashboardStats | null }) {
  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border bg-muted/30 p-4">
        <h3 className="mb-4 font-semibold">Quick Stats</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Premium Users</p>
            <p className="text-xl font-bold">{stats?.premiumUsers || 0}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Pending Approvals</p>
            <p className="text-xl font-bold text-saffron">{stats?.pendingPosts || 0}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

// Posts Tab Component
function PostsTab({ onRefresh }: { onRefresh: () => void }) {
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPendingPosts()
  }, [])

  const fetchPendingPosts = async () => {
    try {
      const response = await fetch("/api/admin/posts/pending")
      const data = await response.json()
      if (data.success) {
        setPosts(data.posts || [])
      }
    } catch (error) {
      console.error("Failed to fetch posts:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (postId: string) => {
    try {
      const response = await fetch(`/api/admin/posts/${postId}/approve`, {
        method: "POST",
      })
      const data = await response.json()
      if (data.success) {
        fetchPendingPosts()
        onRefresh()
      }
    } catch (error) {
      console.error("Failed to approve post:", error)
    }
  }

  const handleReject = async (postId: string) => {
    try {
      const response = await fetch(`/api/admin/posts/${postId}/reject`, {
        method: "POST",
      })
      const data = await response.json()
      if (data.success) {
        fetchPendingPosts()
        onRefresh()
      }
    } catch (error) {
      console.error("Failed to reject post:", error)
    }
  }

  if (loading) {
    return <div className="text-center text-muted-foreground">Loading posts...</div>
  }

  return (
    <div className="space-y-4">
      {posts.length === 0 ? (
        <div className="rounded-lg border border-border p-8 text-center text-muted-foreground">
          No pending posts to review
        </div>
      ) : (
        posts.map((post) => (
          <div key={post.id} className="rounded-lg border border-border p-4">
            <div className="mb-2 flex items-start justify-between">
              <div>
                <h4 className="font-semibold">{post.title}</h4>
                <p className="text-sm text-muted-foreground">{post.description}</p>
              </div>
              <Badge variant="outline">Pending</Badge>
            </div>
            <div className="mt-4 flex gap-2">
              <Button
                size="sm"
                onClick={() => handleApprove(post.id)}
                className="flex-1"
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Approve
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleReject(post.id)}
                className="flex-1"
              >
                <XCircle className="mr-2 h-4 w-4" />
                Reject
              </Button>
            </div>
          </div>
        ))
      )}
    </div>
  )
}

// Cities Tab Component
function CitiesTab({ onRefresh }: { onRefresh: () => void }) {
  const [cities, setCities] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newCity, setNewCity] = useState({ name: "", country_code: "", flag_emoji: "" })

  useEffect(() => {
    fetchCities()
  }, [])

  const fetchCities = async () => {
    try {
      const response = await fetch("/api/admin/cities")
      const data = await response.json()
      if (data.success) {
        setCities(data.cities || [])
      }
    } catch (error) {
      console.error("Failed to fetch cities:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddCity = async () => {
    if (!newCity.name || !newCity.country_code || !newCity.flag_emoji) {
      alert("Please fill all fields")
      return
    }

    try {
      const response = await fetch("/api/admin/cities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCity),
      })

      const data = await response.json()
      if (data.success) {
        setNewCity({ name: "", country_code: "", flag_emoji: "" })
        setShowAddForm(false)
        fetchCities()
        onRefresh()
      }
    } catch (error) {
      alert("Failed to add city")
    }
  }

  const handleToggleCity = async (cityId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/admin/cities/${cityId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !isActive }),
      })

      const data = await response.json()
      if (data.success) {
        fetchCities()
        onRefresh()
      }
    } catch (error) {
      alert("Failed to update city")
    }
  }

  if (loading) {
    return <div className="text-center text-muted-foreground">Loading cities...</div>
  }

  return (
    <div className="space-y-4">
      <Button className="w-full" onClick={() => setShowAddForm(!showAddForm)}>
        <MapPin className="mr-2 h-4 w-4" />
        {showAddForm ? "Cancel" : "Add New City"}
      </Button>

      {showAddForm && (
        <div className="rounded-lg border border-border p-4 space-y-3">
          <Input
            placeholder="City name (e.g., Toronto)"
            value={newCity.name}
            onChange={(e) => setNewCity({ ...newCity, name: e.target.value })}
          />
          <Input
            placeholder="Country code (e.g., CA)"
            value={newCity.country_code}
            onChange={(e) => setNewCity({ ...newCity, country_code: e.target.value.toUpperCase() })}
            maxLength={2}
          />
          <Input
            placeholder="Flag emoji (e.g., 🇨🇦)"
            value={newCity.flag_emoji}
            onChange={(e) => setNewCity({ ...newCity, flag_emoji: e.target.value })}
          />
          <Button onClick={handleAddCity} className="w-full">
            Add City
          </Button>
        </div>
      )}

      <div className="space-y-2">
        {cities.map((city) => (
          <div key={city.id} className="flex items-center justify-between rounded-lg border border-border p-3">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{city.flag_emoji}</span>
              <div>
                <p className="font-medium">{city.name}</p>
                <p className="text-xs text-muted-foreground">{city.country_code}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={city.is_active ? "default" : "outline"}>
                {city.is_active ? "Active" : "Inactive"}
              </Badge>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleToggleCity(city.id, city.is_active)}
              >
                {city.is_active ? "Deactivate" : "Activate"}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Revenue Tab Component
function RevenueTab() {
  const [payments, setPayments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [totalRevenue, setTotalRevenue] = useState(0)

  useEffect(() => {
    fetchRevenue()
  }, [])

  const fetchRevenue = async () => {
    try {
      const response = await fetch("/api/admin/revenue")
      const data = await response.json()
      if (data.success) {
        setPayments(data.payments || [])
        setTotalRevenue(data.totalRevenue || 0)
      }
    } catch (error) {
      console.error("Failed to fetch revenue:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="text-center text-muted-foreground">Loading revenue...</div>
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border bg-muted/30 p-4">
        <h3 className="mb-2 font-semibold">Total Revenue</h3>
        <p className="text-3xl font-bold text-saffron">₹{totalRevenue.toLocaleString()}</p>
      </div>

      <div className="space-y-2">
        <h4 className="font-semibold">Recent Payments</h4>
        {payments.length === 0 ? (
          <div className="rounded-lg border border-border p-4 text-center text-muted-foreground">
            No payments yet
          </div>
        ) : (
          payments.map((payment) => (
            <div key={payment.id} className="rounded-lg border border-border p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">
                    {payment.currency} {payment.amount}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(payment.created_at).toLocaleDateString()}
                  </p>
                </div>
                <Badge variant={payment.status === "completed" ? "default" : "outline"}>
                  {payment.status}
                </Badge>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

// Groups Tab Component
function GroupsTab() {
  return (
    <div className="space-y-4">
      <div className="text-center text-muted-foreground">
        Auto-share groups management coming soon
      </div>
    </div>
  )
}

