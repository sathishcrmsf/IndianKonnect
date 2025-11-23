import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase/client"

/**
 * GET /api/admin/stats
 * Get dashboard statistics for admin
 */
export async function GET(request: NextRequest) {
  try {
    // Verify admin access (in production, check admin token from headers)
    // For now, we'll trust the request comes from authenticated admin

    // Get total users
    const { count: totalUsers } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true })

    // Get total posts
    const { count: totalPosts } = await supabase
      .from("posts")
      .select("*", { count: "exact", head: true })

    // Get pending posts (posts that need approval - for now, all active posts)
    // In future, add an approval_status field
    const { count: pendingPosts } = await supabase
      .from("posts")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true)

    // Get premium users
    const { count: premiumUsers } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true })
      .eq("is_premium", true)

    // Get total revenue
    const { data: payments } = await supabase
      .from("payments")
      .select("amount, currency")
      .eq("status", "completed")

    let totalRevenue = 0
    if (payments) {
      totalRevenue = payments.reduce((sum, payment) => {
        // Convert to INR for display (simplified - in production, use proper exchange rates)
        if (payment.currency === "INR") {
          return sum + Number(payment.amount)
        } else if (payment.currency === "USD") {
          return sum + Number(payment.amount) * 83 // Approximate conversion
        }
        return sum
      }, 0)
    }

    // Get active cities
    const { count: activeCities } = await supabase
      .from("cities")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true)

    return NextResponse.json({
      success: true,
      stats: {
        totalUsers: totalUsers || 0,
        totalPosts: totalPosts || 0,
        pendingPosts: pendingPosts || 0,
        totalRevenue: Math.round(totalRevenue),
        premiumUsers: premiumUsers || 0,
        activeCities: activeCities || 0,
      },
    })
  } catch (error) {
    console.error("Admin stats error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

