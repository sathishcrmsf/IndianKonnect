/**
 * Mock WhatsApp OTP service
 * In production, this would integrate with Twilio or WhatsApp Business API
 */

export async function sendOTP(phoneNumber: string): Promise<{ success: boolean; code?: string }> {
  // Mock: In development, return a test code
  if (process.env.NODE_ENV === "development") {
    return {
      success: true,
      code: "123456", // Test code for development
    }
  }

  // In production, this would call Twilio/WhatsApp API
  // const response = await fetch('/api/whatsapp/send-otp', {
  //   method: 'POST',
  //   body: JSON.stringify({ phone: phoneNumber })
  // })
  // return response.json()

  return { success: false }
}

export async function verifyOTP(
  phoneNumber: string,
  code: string
): Promise<{ success: boolean; token?: string }> {
  // Mock: In development, accept test code
  if (process.env.NODE_ENV === "development" && code === "123456") {
    return {
      success: true,
      token: "mock-jwt-token",
    }
  }

  // In production, verify with Twilio/WhatsApp API
  return { success: false }
}

