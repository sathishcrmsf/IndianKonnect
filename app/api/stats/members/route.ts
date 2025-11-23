import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase/client"

/**
 * GET /api/stats/members
 * Get total member count for launch page
 */
export async function GET(request: NextRequest) {
  try {
    // Get total users count
    const { count } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true })

    // Get premium members count
    const { count: premiumCount } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true })
      .eq("is_premium", true)

    return NextResponse.json({
      count: count || 0,
      premiumCount: premiumCount || 0,
    })
  } catch (error) {
    console.error("Stats error:", error)
    return NextResponse.json(
      { count: 200, premiumCount: 0 }, // Default fallback
      { status: 200 }
    )
  }
}

