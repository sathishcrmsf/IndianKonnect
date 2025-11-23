import { NextRequest, NextResponse } from "next/server"
import {
  verifyRazorpayPayment,
  verifyStripePayment,
} from "@/lib/services/payments"
import { supabase } from "@/lib/supabase/client"

/**
 * POST /api/payments/verify
 * Verifies payment and upgrades user to premium
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { paymentId, orderId, signature, provider, userId } = body

    if (!paymentId || !provider) {
      return NextResponse.json(
        { error: "Missing payment information" },
        { status: 400 }
      )
    }

    // Verify payment with provider
    let verification
    if (provider === "razorpay") {
      verification = await verifyRazorpayPayment(
        paymentId,
        orderId || "",
        signature || ""
      )
    } else {
      verification = await verifyStripePayment(paymentId)
    }

    if (!verification.success) {
      return NextResponse.json(
        { error: "Payment verification failed" },
        { status: 400 }
      )
    }

    // Get user ID from request or session
    const userPhone = body.userPhone || body.phone
    if (!userPhone && !userId) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 400 }
      )
    }

    // Find user
    let user
    if (userId) {
      const { data } = await supabase
        .from("users")
        .select("id")
        .eq("id", userId)
        .single()
      user = data
    } else if (userPhone) {
      const { data } = await supabase
        .from("users")
        .select("id")
        .eq("phone", userPhone)
        .single()
      user = data
    }

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Get current premium count for member number
    const { count } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true })
      .eq("is_premium", true)

    const memberNumber = (count || 0) + 1

    // Upgrade user to premium
    const { error: updateError } = await supabase
      .from("users")
      .update({
        is_premium: true,
        is_verified: true,
        verified_at: new Date().toISOString(),
      })
      .eq("id", user.id)

    if (updateError) {
      console.error("Error upgrading user:", updateError)
      return NextResponse.json(
        { error: "Failed to upgrade user" },
        { status: 500 }
      )
    }

    // Store payment record
    await supabase.from("payments").insert({
      user_id: user.id,
      amount: verification.amount || (provider === "razorpay" ? 299 : 19),
      currency: provider === "razorpay" ? "INR" : "USD",
      provider,
      payment_id: paymentId,
      order_id: orderId || null,
      status: "completed",
      metadata: {
        member_number: memberNumber,
        verified_at: new Date().toISOString(),
      },
    })

    return NextResponse.json({
      success: true,
      message: "Payment verified and account upgraded!",
      memberNumber,
    })
  } catch (error) {
    console.error("Payment verification error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

