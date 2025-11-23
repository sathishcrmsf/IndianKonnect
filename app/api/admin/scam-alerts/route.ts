import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase/client"
import { sendWhatsAppMessage } from "@/lib/services/whatsapp"

/**
 * POST /api/admin/scam-alerts
 * Send weekly scam alerts to all users
 * This should be called by a cron job weekly
 */
export async function POST(request: NextRequest) {
  try {
    // Verify admin access (in production, check admin token)
    const authHeader = request.headers.get("authorization")
    if (authHeader !== `Bearer ${process.env.ADMIN_SECRET_KEY}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get all reported posts from last week
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

    const { data: reports, error: reportsError } = await supabase
      .from("reports")
      .select("*, post:posts(title, description, user_id)")
      .eq("status", "reviewed")
      .gte("created_at", oneWeekAgo.toISOString())

    if (reportsError) {
      return NextResponse.json(
        { error: "Failed to fetch reports" },
        { status: 500 }
      )
    }

    // Get all active users
    const { data: users, error: usersError } = await supabase
      .from("users")
      .select("phone, is_premium")
      .not("phone", "is", null)

    if (usersError) {
      return NextResponse.json(
        { error: "Failed to fetch users" },
        { status: 500 }
      )
    }

    // Create scam alert message
    const scamCount = reports?.length || 0
    const message = `🚨 *IndianKonnect Weekly Scam Alert*\n\n` +
      `We reviewed ${scamCount} reported posts this week and removed ${scamCount} suspicious listings.\n\n` +
      `Stay safe:\n` +
      `✅ Always verify before paying\n` +
      `✅ Meet in public places\n` +
      `✅ Report suspicious posts\n\n` +
      `Thank you for keeping IndianKonnect safe! 🇮🇳`

    // Send to all users (in batches to avoid rate limits)
    let sent = 0
    let failed = 0

    for (const user of users || []) {
      if (user.phone) {
        const result = await sendWhatsAppMessage(user.phone, message)
        if (result.success) {
          sent++
        } else {
          failed++
        }
        // Rate limiting: wait 1 second between messages
        await new Promise((resolve) => setTimeout(resolve, 1000))
      }
    }

    return NextResponse.json({
      success: true,
      message: `Scam alerts sent to ${sent} users`,
      sent,
      failed,
      scamCount,
    })
  } catch (error) {
    console.error("Scam alert error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

