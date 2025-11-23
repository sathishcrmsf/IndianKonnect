import { NextRequest, NextResponse } from "next/server"
import { parseWhatsAppMessage } from "@/lib/services/openai"
import { sendWhatsAppMessage, formatPostLink } from "@/lib/services/whatsapp"
import { canUserPost } from "@/lib/services/post-limits"
import { supabase } from "@/lib/supabase/client"

/**
 * Twilio WhatsApp Webhook Handler
 * POST /api/whatsapp/incoming
 * 
 * Handles incoming WhatsApp messages via Twilio
 * When user types "post" or "konnect", parses the message and creates a post
 */
export async function POST(request: NextRequest) {
  try {
    // Parse Twilio webhook data
    const formData = await request.formData()
    const from = formData.get("From") as string
    const body = formData.get("Body") as string
    const messageSid = formData.get("MessageSid") as string

    if (!from || !body) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Extract phone number from Twilio format (whatsapp:+1234567890)
    const phoneNumber = from.replace("whatsapp:", "").trim()

    // Check if message contains "post" or "konnect" trigger
    const lowerBody = body.toLowerCase().trim()
    const isPostCommand =
      lowerBody === "post" ||
      lowerBody === "konnect" ||
      lowerBody.startsWith("post ") ||
      lowerBody.startsWith("konnect ")

    if (!isPostCommand) {
      // Not a post command, ignore
      return new Response(
        '<?xml version="1.0" encoding="UTF-8"?><Response></Response>',
        { headers: { "Content-Type": "text/xml" } }
      )
    }

    // Extract the actual message (remove "post" or "konnect" prefix)
    const messageText = body
      .replace(/^(post|konnect)\s+/i, "")
      .trim()

    if (!messageText) {
      const reply = `Please send your post details after "post" or "konnect".\n\nExample:\npost Room available in Brampton, ₹650/month, veg only`
      await sendWhatsAppMessage(phoneNumber, reply)
      return new Response(
        '<?xml version="1.0" encoding="UTF-8"?><Response></Response>',
        { headers: { "Content-Type": "text/xml" } }
      )
    }

    // Find or create user by phone number
    let { data: user, error: userError } = await supabase
      .from("users")
      .select("id, is_premium, city_id")
      .eq("phone", phoneNumber)
      .single()

    if (userError || !user) {
      // Create new user
      const { data: newUser, error: createError } = await supabase
        .from("users")
        .insert({
          phone: phoneNumber,
          city_id: null, // Will be set later
        })
        .select()
        .single()

      if (createError || !newUser) {
        await sendWhatsAppMessage(
          phoneNumber,
          "Sorry, there was an error creating your account. Please try again later."
        )
        return NextResponse.json(
          { error: "Failed to create user" },
          { status: 500 }
        )
      }

      user = newUser
    }

    // Ensure user exists
    if (!user) {
      await sendWhatsAppMessage(
        phoneNumber,
        "Sorry, there was an error with your account. Please try again later."
      )
      return NextResponse.json(
        { error: "User not found" },
        { status: 500 }
      )
    }

    // Check if user can post
    const postCheck = await canUserPost(user.id)
    if (!postCheck.canPost) {
      await sendWhatsAppMessage(
        phoneNumber,
        `❌ ${postCheck.reason}\n\nUpgrade at: ${process.env.NEXT_PUBLIC_APP_URL || "https://indiankonnect.com"}/pricing`
      )
      return new Response(
        '<?xml version="1.0" encoding="UTF-8"?><Response></Response>',
        { headers: { "Content-Type": "text/xml" } }
      )
    }

    // Parse message with GPT-4o-mini
    const parsedPost = await parseWhatsAppMessage(messageText)

    if (!parsedPost) {
      await sendWhatsAppMessage(
        phoneNumber,
        "Sorry, I couldn't parse your message. Please include: category, description, and price (if applicable)."
      )
      return NextResponse.json(
        { error: "Failed to parse message" },
        { status: 400 }
      )
    }

    // Get or set user's city
    let cityId = user.city_id
    if (!cityId && parsedPost.city) {
      // Try to find city by name
      const { data: city } = await supabase
        .from("cities")
        .select("id")
        .ilike("name", `%${parsedPost.city}%`)
        .limit(1)
        .single()

      if (city) {
        cityId = city.id
        // Update user's city
        await supabase
          .from("users")
          .update({ city_id: city.id })
          .eq("id", user.id)
      }
    }

    // Create post in Supabase
    const { data: post, error: postError } = await supabase
      .from("posts")
      .insert({
        user_id: user.id,
        category: parsedPost.category,
        title: parsedPost.title,
        description: parsedPost.description,
        price: parsedPost.price || null,
        currency: parsedPost.currency || "INR",
        images: [],
        city_id: cityId,
        veg_only: parsedPost.veg_only || false,
        gender_filter: parsedPost.gender_filter || "both",
        is_anonymous: false,
        is_premium: user.is_premium || false,
      })
      .select()
      .single()

    if (postError || !post) {
      console.error("Error creating post:", postError)
      await sendWhatsAppMessage(
        phoneNumber,
        "Sorry, there was an error creating your post. Please try again later."
      )
      return NextResponse.json(
        { error: "Failed to create post" },
        { status: 500 }
      )
    }

    // Send success message with link
    const postLink = formatPostLink(post.id)
    const freePostsMsg = postCheck.freePostsRemaining
      ? `\n\n🆓 Free posts remaining: ${postCheck.freePostsRemaining}`
      : ""

    const reply = `✅ Post created successfully!\n\n📱 View your post:\n${postLink}${freePostsMsg}\n\nShare this link with others!`

    await sendWhatsAppMessage(phoneNumber, reply)

    // Return TwiML response (empty, we already sent the message)
    return new Response(
      '<?xml version="1.0" encoding="UTF-8"?><Response></Response>',
      { headers: { "Content-Type": "text/xml" } }
    )
  } catch (error) {
    console.error("WhatsApp webhook error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// GET endpoint for webhook verification (Twilio requires this)
export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: "WhatsApp webhook endpoint is active",
    endpoint: "/api/whatsapp/incoming",
  })
}
