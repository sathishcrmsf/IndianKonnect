import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase/client"
import { Post } from "@/types"

// GET /api/posts - Get all posts with filters
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const cityId = searchParams.get("cityId")
    const category = searchParams.get("category")
    const limit = parseInt(searchParams.get("limit") || "50")

    let query = supabase
      .from("posts")
      .select("*, user:users(*), city:cities(*)")
      .eq("is_active", true) // Only show active posts
      .order("created_at", { ascending: false })
      .limit(limit)

    if (cityId) {
      query = query.eq("city_id", cityId)
    }

    if (category) {
      query = query.eq("category", category)
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ posts: data || [] })
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// POST /api/posts - Create a new post
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      user_id,
      category,
      title,
      description,
      price,
      currency,
      images,
      city_id,
      veg_only,
      gender_filter,
      is_anonymous,
    } = body

    // Validate required fields
    if (!user_id || !category || !title || !description) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from("posts")
      .insert({
        user_id,
        category,
        title,
        description,
        price: price || null,
        currency: currency || "INR",
        images: images || [],
        city_id,
        veg_only: veg_only || false,
        gender_filter: gender_filter || "both",
        is_anonymous: is_anonymous || false,
        is_verified_owner: false, // Default to false, can be updated later
        is_active: true, // New posts are active by default
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ post: data }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

