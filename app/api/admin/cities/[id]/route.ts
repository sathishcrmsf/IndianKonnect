import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase/client"

/**
 * PATCH /api/admin/cities/[id]
 * Update a city (activate/deactivate)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { is_active } = body
    const cityId = params.id

    const { error } = await supabase
      .from("cities")
      .update({ is_active })
      .eq("id", cityId)

    if (error) {
      return NextResponse.json(
        { error: "Failed to update city" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "City updated successfully",
    })
  } catch (error) {
    console.error("Update city error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

