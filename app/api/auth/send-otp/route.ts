import { NextRequest, NextResponse } from "next/server"
import { sendOTP } from "@/lib/services/otp"

/**
 * POST /api/auth/send-otp
 * Sends OTP to phone number via WhatsApp
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

    const result = await sendOTP(phoneNumber)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to send OTP" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "OTP sent successfully",
      // In development, return OTP for testing
      ...(process.env.NODE_ENV === "development" && { otp: result.code }),
    })
  } catch (error) {
    console.error("Send OTP error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

