import { NextRequest, NextResponse } from "next/server"
import { verifyOTP } from "@/lib/services/otp"
import { supabase } from "@/lib/supabase/client"

/**
 * POST /api/auth/verify-otp
 * Verifies OTP and creates/updates user
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { phoneNumber, otp, cityId } = body

    if (!phoneNumber || !otp) {
      return NextResponse.json(
        { error: "Phone number and OTP are required" },
        { status: 400 }
      )
    }

    // Verify OTP
    const verification = await verifyOTP(phoneNumber, otp)

    if (!verification.success) {
      return NextResponse.json(
        { error: "Invalid OTP" },
        { status: 400 }
      )
    }

    // Get or create user
    let { data: user, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("phone", phoneNumber)
      .single()

    if (userError || !user) {
      // Create new user
      const { data: newUser, error: createError } = await supabase
        .from("users")
        .insert({
          phone: phoneNumber,
          city_id: cityId || null,
          is_verified: true,
          verified_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (createError || !newUser) {
        return NextResponse.json(
          { error: "Failed to create user" },
          { status: 500 }
        )
      }

      user = newUser
    } else {
      // Update existing user
      const { data: updatedUser, error: updateError } = await supabase
        .from("users")
        .update({
          is_verified: true,
          verified_at: new Date().toISOString(),
          ...(cityId && { city_id: cityId }),
        })
        .eq("id", user.id)
        .select()
        .single()

      if (updateError || !updatedUser) {
        return NextResponse.json(
          { error: "Failed to update user" },
          { status: 500 }
        )
      }

      user = updatedUser
    }

    return NextResponse.json({
      success: true,
      user,
      token: verification.token, // JWT token for session
    })
  } catch (error) {
    console.error("Verify OTP error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

