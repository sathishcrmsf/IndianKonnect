/**
 * OTP service for phone verification via WhatsApp
 * Uses whatsapp-web.js bot to send OTP codes
 */

import { sendWhatsAppMessage } from "./whatsapp"

// Store OTPs in memory (in production, use Redis or database)
const otpStore = new Map<string, { code: string; expiresAt: number }>()

// Generate 6-digit OTP
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

/**
 * Send OTP to phone number via WhatsApp
 */
export async function sendOTP(
  phoneNumber: string
): Promise<{ success: boolean; code?: string; error?: string }> {
  try {
    // Generate OTP
    const otp = generateOTP()
    const expiresAt = Date.now() + 10 * 60 * 1000 // 10 minutes

    // Store OTP
    otpStore.set(phoneNumber, { code: otp, expiresAt })

    // In development, log OTP
    if (process.env.NODE_ENV === "development") {
      console.log(`[DEV] OTP for ${phoneNumber}: ${otp}`)
      return {
        success: true,
        code: otp, // Return for testing
      }
    }

    // Send via WhatsApp
    const message = `Your IndianKonnect verification code is: ${otp}\n\nThis code expires in 10 minutes.`
    const result = await sendWhatsAppMessage(phoneNumber, message)

    if (!result.success) {
      otpStore.delete(phoneNumber)
      return {
        success: false,
        error: result.error || "Failed to send OTP",
      }
    }

    return { success: true }
  } catch (error) {
    console.error("Send OTP error:", error)
    return {
      success: false,
      error: "Failed to send OTP",
    }
  }
}

/**
 * Verify OTP
 */
export async function verifyOTP(
  phoneNumber: string,
  code: string
): Promise<{ success: boolean; token?: string; error?: string }> {
  try {
    const stored = otpStore.get(phoneNumber)

    if (!stored) {
      return {
        success: false,
        error: "OTP not found or expired",
      }
    }

    // Check expiration
    if (Date.now() > stored.expiresAt) {
      otpStore.delete(phoneNumber)
      return {
        success: false,
        error: "OTP expired",
      }
    }

    // Verify code
    if (stored.code !== code) {
      return {
        success: false,
        error: "Invalid OTP",
      }
    }

    // Remove OTP after successful verification
    otpStore.delete(phoneNumber)

    // Generate JWT token (in production, use proper JWT library)
    const token = `jwt_${Date.now()}_${Math.random().toString(36).substring(7)}`

    return {
      success: true,
      token,
    }
  } catch (error) {
    console.error("Verify OTP error:", error)
    return {
      success: false,
      error: "Failed to verify OTP",
    }
  }
}

/**
 * Resend OTP
 */
export async function resendOTP(
  phoneNumber: string
): Promise<{ success: boolean; code?: string; error?: string }> {
  // Remove old OTP if exists
  otpStore.delete(phoneNumber)
  return sendOTP(phoneNumber)
}

