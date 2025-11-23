import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase/client"

/**
 * POST /api/admin/posts/[id]/reject
 * Reject a post (deactivate it)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const postId = params.id

    // Reject post (deactivate it)
    const { error } = await supabase
      .from("posts")
      .update({ is_active: false })
      .eq("id", postId)

    if (error) {
      return NextResponse.json(
        { error: "Failed to reject post" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Post rejected successfully",
    })
  } catch (error) {
    console.error("Reject post error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

