import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase/client"

/**
 * POST /api/admin/posts/[id]/approve
 * Approve a post
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const postId = params.id

    // Approve post (ensure it's active)
    const { error } = await supabase
      .from("posts")
      .update({ is_active: true })
      .eq("id", postId)

    if (error) {
      return NextResponse.json(
        { error: "Failed to approve post" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Post approved successfully",
    })
  } catch (error) {
    console.error("Approve post error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

