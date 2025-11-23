import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase/client"

/**
 * POST /api/admin/check
 * Check if a phone number is authorized as admin
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { phoneNumber } = body

    if (!phoneNumber) {
      return NextResponse.json(
        { error: "Phone number is required" },
        { status: 400 }
      )
    }

    // Normalize phone number
    const normalizedPhone = phoneNumber.replace(/[\s\-\(\)]/g, "")
    const phoneWithPlus = normalizedPhone.startsWith("+") 
      ? normalizedPhone 
      : `+${normalizedPhone}`

    // Check if user exists and is admin
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("phone", phoneWithPlus)
      .single()

    if (userError || !user) {
      return NextResponse.json(
        { isAdmin: false, error: "User not found" },
        { status: 404 }
      )
    }

    if (!user.is_admin) {
      return NextResponse.json(
        { isAdmin: false, error: "Not authorized as admin" },
        { status: 403 }
      )
    }

    // Generate admin token
    const token = `admin_${Date.now()}_${Math.random().toString(36).substring(7)}`

    return NextResponse.json({
      isAdmin: true,
      user: {
        id: user.id,
        phone: user.phone,
        is_admin: true,
      },
      token,
    })
  } catch (error) {
    console.error("Admin check error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

