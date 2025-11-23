import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase/client"
import { sendWhatsAppMessage } from "@/lib/services/whatsapp"
import { generateLaunchMessage } from "@/lib/services/share"

/**
 * POST /api/admin/broadcast
 * Send launch announcement to all users via WhatsApp
 * This should be called manually by admin for launch
 */
export async function POST(request: NextRequest) {
  try {
    // Verify admin access
    const authHeader = request.headers.get("authorization")
    if (authHeader !== `Bearer ${process.env.ADMIN_SECRET_KEY}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://indiankonnect.com"

    // Get all users with phone numbers
    const { data: users, error: usersError } = await supabase
      .from("users")
      .select("phone")
      .not("phone", "is", null)

    if (usersError) {
      return NextResponse.json(
        { error: "Failed to fetch users" },
        { status: 500 }
      )
    }

    // Get member count
    const { count: memberCount } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true })
      .eq("is_premium", true)

    // Generate launch message
    const message = generateLaunchMessage(appUrl, memberCount || 0)

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
      message: `Launch announcement sent to ${sent} users`,
      sent,
      failed,
    })
  } catch (error) {
    console.error("Broadcast error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

