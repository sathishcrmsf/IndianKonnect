import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase/client"

/**
 * POST /api/posts/[id]/success
 * Mark a deal as successful and increment user success counter
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { userId } = body
    const postId = params.id

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      )
    }

    // Get post owner
    const { data: post, error: postError } = await supabase
      .from("posts")
      .select("user_id")
      .eq("id", postId)
      .single()

    if (postError || !post) {
      return NextResponse.json(
        { error: "Post not found" },
        { status: 404 }
      )
    }

    // Increment success count for post owner
    const { error: updateError } = await supabase.rpc("increment_user_success_count", {
      user_id_param: post.user_id,
    })

    if (updateError) {
      // Fallback: manual update if function doesn't exist
      const { data: user } = await supabase
        .from("users")
        .select("success_count")
        .eq("id", post.user_id)
        .single()

      await supabase
        .from("users")
        .update({
          success_count: (user?.success_count || 0) + 1,
        })
        .eq("id", post.user_id)
    }

    return NextResponse.json({
      success: true,
      message: "Success count updated",
    })
  } catch (error) {
    console.error("Success counter error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

