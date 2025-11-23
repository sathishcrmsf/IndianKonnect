/**
 * WhatsApp/Twilio service for sending messages
 */

export async function sendWhatsAppMessage(
  to: string,
  message: string
): Promise<{ success: boolean; error?: string }> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID
  const authToken = process.env.TWILIO_AUTH_TOKEN
  const fromNumber = process.env.TWILIO_PHONE_NUMBER

  if (!accountSid || !authToken || !fromNumber) {
    // Mock for development
    console.log(`[MOCK] Sending WhatsApp to ${to}: ${message}`)
    return { success: true }
  }

  try {
    // Format phone number (remove + and ensure proper format)
    const formattedTo = to.replace(/\D/g, "")

    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString("base64")}`,
        },
        body: new URLSearchParams({
          From: `whatsapp:${fromNumber}`,
          To: `whatsapp:${formattedTo}`,
          Body: message,
        }),
      }
    )

    const data = await response.json()

    if (!response.ok) {
      return { success: false, error: data.message || "Failed to send message" }
    }

    return { success: true }
  } catch (error) {
    console.error("Twilio error:", error)
    return { success: false, error: "Failed to send WhatsApp message" }
  }
}

export function formatPostLink(postId: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://indiankonnect.com"
  return `${baseUrl}/posts/${postId}`
}

