import { NextRequest, NextResponse } from "next/server"
import { createRazorpayOrder, createStripePayment } from "@/lib/services/payments"

/**
 * POST /api/payments/create
 * Creates a payment order for Razorpay (India) or Stripe (International)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, plan, amount, currency } = body

    if (!userId || !plan || !amount) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    if (plan === "india") {
      // Razorpay for India
      const order = await createRazorpayOrder(amount, currency)

      return NextResponse.json({
        success: true,
        razorpayOrderId: order.id,
        amount: order.amount,
        currency: order.currency,
      })
    } else {
      // Stripe for International
      const payment = await createStripePayment(amount, currency)

      return NextResponse.json({
        success: true,
        clientSecret: payment.clientSecret,
        sessionId: payment.id,
        checkoutUrl: `/api/payments/stripe-checkout?session=${payment.id}`,
      })
    }
  } catch (error) {
    console.error("Payment creation error:", error)
    return NextResponse.json(
      { error: "Failed to create payment" },
      { status: 500 }
    )
  }
}

