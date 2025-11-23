import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase/client"

/**
 * GET /api/admin/posts/pending
 * Get all pending posts for approval
 */
export async function GET(request: NextRequest) {
  try {
    // Get pending posts (posts with is_active = false, awaiting approval)
    const { data: posts, error } = await supabase
      .from("posts")
      .select("*, user:users(phone), city:cities(name)")
      .eq("is_active", false)
      .order("created_at", { ascending: false })
      .limit(50)

    if (error) {
      return NextResponse.json(
        { error: "Failed to fetch posts" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      posts: posts || [],
    })
  } catch (error) {
    console.error("Pending posts error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

