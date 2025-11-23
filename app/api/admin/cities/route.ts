import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase/client"

/**
 * GET /api/admin/cities
 * Get all cities
 */
export async function GET(request: NextRequest) {
  try {
    const { data: cities, error } = await supabase
      .from("cities")
      .select("*")
      .order("name", { ascending: true })

    if (error) {
      return NextResponse.json(
        { error: "Failed to fetch cities" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      cities: cities || [],
    })
  } catch (error) {
    console.error("Cities error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/cities
 * Create a new city
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, country_code, flag_emoji } = body

    if (!name || !country_code || !flag_emoji) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const { data: city, error } = await supabase
      .from("cities")
      .insert({
        name,
        country_code,
        flag_emoji,
        is_active: true,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: "Failed to create city" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      city,
    })
  } catch (error) {
    console.error("Create city error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

