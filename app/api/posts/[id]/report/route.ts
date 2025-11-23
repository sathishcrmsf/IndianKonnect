import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase/client"

/**
 * POST /api/posts/[id]/report
 * Report a post (scam, spam, etc.)
 * Auto-hides post after 3 reports
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { userId, reason } = body
    const postId = params.id

    if (!userId || !reason) {
      return NextResponse.json(
        { error: "User ID and reason are required" },
        { status: 400 }
      )
    }

    // Check if user already reported this post
    const { data: existingReport } = await supabase
      .from("reports")
      .select("*")
      .eq("post_id", postId)
      .eq("user_id", userId)
      .single()

    if (existingReport) {
      return NextResponse.json(
        { error: "You have already reported this post" },
        { status: 400 }
      )
    }

    // Create report
    const { data: report, error: reportError } = await supabase
      .from("reports")
      .insert({
        post_id: postId,
        user_id: userId,
        reason,
        status: "pending",
      })
      .select()
      .single()

    if (reportError || !report) {
      return NextResponse.json(
        { error: "Failed to create report" },
        { status: 500 }
      )
    }

    // Count total reports for this post
    const { count } = await supabase
      .from("reports")
      .select("*", { count: "exact", head: true })
      .eq("post_id", postId)
      .eq("status", "pending")

    // Auto-hide if 3 or more reports
    if (count && count >= 3) {
      await supabase
        .from("posts")
        .update({ is_active: false })
        .eq("id", postId)

      // Update all reports to reviewed
      await supabase
        .from("reports")
        .update({
          status: "reviewed",
          reviewed_at: new Date().toISOString(),
        })
        .eq("post_id", postId)
        .eq("status", "pending")

      return NextResponse.json({
        success: true,
        message: "Post reported and automatically hidden due to multiple reports",
        autoHidden: true,
      })
    }

    return NextResponse.json({
      success: true,
      message: "Post reported successfully",
      reportCount: count || 1,
      autoHidden: false,
    })
  } catch (error) {
    console.error("Report error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

