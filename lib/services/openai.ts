/**
 * OpenAI GPT-4o-mini service for parsing WhatsApp messages into posts
 */

interface ParsedPost {
  category: string
  title: string
  description: string
  price?: number
  currency?: string
  veg_only?: boolean
  gender_filter?: "male" | "female" | "both"
  city?: string
}

export async function parseWhatsAppMessage(
  message: string,
  forwardedFrom?: string
): Promise<ParsedPost | null> {
  const apiKey = process.env.OPENAI_API_KEY

  if (!apiKey) {
    // Mock parsing for development
    return parseMessageMock(message)
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are a parser that extracts post information from WhatsApp messages for IndianKonnect.com.
Extract: category (room_rent, need_room, ride_share, deals, parcel, job, buy_sell, help), title, description, price (if mentioned), currency, veg_only (true/false), gender_filter (male/female/both), city.
Return JSON only, no other text.`,
          },
          {
            role: "user",
            content: `Parse this WhatsApp message into a post:\n\n${message}${
              forwardedFrom ? `\n\nForwarded from: ${forwardedFrom}` : ""
            }`,
          },
        ],
        temperature: 0.3,
        response_format: { type: "json_object" },
      }),
    })

    const data = await response.json()
    const parsed = JSON.parse(data.choices[0].message.content)

    return {
      category: parsed.category || "help",
      title: parsed.title || "Untitled Post",
      description: parsed.description || message,
      price: parsed.price ? parseFloat(parsed.price) : undefined,
      currency: parsed.currency || "INR",
      veg_only: parsed.veg_only || false,
      gender_filter: parsed.gender_filter || "both",
      city: parsed.city,
    }
  } catch (error) {
    console.error("OpenAI parsing error:", error)
    return parseMessageMock(message)
  }
}

function parseMessageMock(message: string): ParsedPost {
  // Simple mock parser for development
  const lowerMessage = message.toLowerCase()

  let category = "help"
  if (lowerMessage.includes("room") || lowerMessage.includes("pg")) {
    category = lowerMessage.includes("need") ? "need_room" : "room_rent"
  } else if (lowerMessage.includes("ride") || lowerMessage.includes("carpool")) {
    category = "ride_share"
  } else if (lowerMessage.includes("deal") || lowerMessage.includes("grocery")) {
    category = "deals"
  } else if (lowerMessage.includes("parcel")) {
    category = "parcel"
  } else if (lowerMessage.includes("job") || lowerMessage.includes("referral")) {
    category = "job"
  } else if (lowerMessage.includes("sell") || lowerMessage.includes("buy")) {
    category = "buy_sell"
  }

  const priceMatch = message.match(/[₹$]?\s*(\d+)/)
  const price = priceMatch ? parseFloat(priceMatch[1]) : undefined

  return {
    category,
    title: message.substring(0, 50) + (message.length > 50 ? "..." : ""),
    description: message,
    price,
    currency: message.includes("$") || message.includes("CAD") ? "CAD" : "INR",
    veg_only: lowerMessage.includes("veg") && !lowerMessage.includes("non-veg"),
    gender_filter: lowerMessage.includes("female") || lowerMessage.includes("girl")
      ? "female"
      : lowerMessage.includes("male") || lowerMessage.includes("boy")
      ? "male"
      : "both",
  }
}

