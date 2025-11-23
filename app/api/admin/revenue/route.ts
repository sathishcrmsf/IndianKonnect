import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase/client"

/**
 * GET /api/admin/revenue
 * Get revenue statistics and payment history
 */
export async function GET(request: NextRequest) {
  try {
    // Get all completed payments
    const { data: payments, error } = await supabase
      .from("payments")
      .select("*")
      .eq("status", "completed")
      .order("created_at", { ascending: false })
      .limit(100)

    if (error) {
      return NextResponse.json(
        { error: "Failed to fetch payments" },
        { status: 500 }
      )
    }

    // Calculate total revenue
    let totalRevenue = 0
    if (payments) {
      totalRevenue = payments.reduce((sum, payment) => {
        // Convert to INR for display
        if (payment.currency === "INR") {
          return sum + Number(payment.amount)
        } else if (payment.currency === "USD") {
          return sum + Number(payment.amount) * 83 // Approximate conversion
        }
        return sum
      }, 0)
    }

    return NextResponse.json({
      success: true,
      payments: payments || [],
      totalRevenue: Math.round(totalRevenue),
    })
  } catch (error) {
    console.error("Revenue error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

