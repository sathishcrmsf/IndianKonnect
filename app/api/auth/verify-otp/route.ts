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

    // Check if user doesn't exist (error code PGRST116 means no rows returned)
    if (userError && userError.code !== "PGRST116" && userError.code !== "42P01") {
      console.error("Error fetching user:", userError)
      return NextResponse.json(
        { error: "Failed to fetch user", details: userError.message },
        { status: 500 }
      )
    }

    if (!user) {
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

      if (createError) {
        console.error("Error creating user:", createError)
        return NextResponse.json(
          { 
            error: "Failed to create user", 
            details: createError.message,
            code: createError.code,
            hint: createError.hint
          },
          { status: 500 }
        )
      }

      if (!newUser) {
        console.error("User creation returned no data")
        return NextResponse.json(
          { error: "Failed to create user - no data returned" },
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

      if (updateError) {
        console.error("Error updating user:", updateError)
        return NextResponse.json(
          { 
            error: "Failed to update user",
            details: updateError.message,
            code: updateError.code
          },
          { status: 500 }
        )
      }

      if (!updatedUser) {
        console.error("User update returned no data")
        return NextResponse.json(
          { error: "Failed to update user - no data returned" },
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

