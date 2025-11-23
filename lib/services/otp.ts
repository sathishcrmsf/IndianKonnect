/**
 * OTP service for phone verification via WhatsApp
 * Uses whatsapp-web.js bot to send OTP codes
 */

import { sendWhatsAppMessage } from "./whatsapp"

// Store OTPs in memory (in production, use Redis or database)
const otpStore = new Map<string, { code: string; expiresAt: number }>()

// Normalize phone number to consistent format
function normalizePhoneNumber(phone: string): string {
  // Remove all spaces, dashes, and parentheses
  let normalized = phone.replace(/[\s\-\(\)]/g, "")
  
  // Ensure it starts with +
  if (!normalized.startsWith("+")) {
    // If it doesn't start with +, add it
    normalized = "+" + normalized
  }
  
  return normalized
}

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
    // Normalize phone number
    const normalizedPhone = normalizePhoneNumber(phoneNumber)
    
    // Generate OTP
    const otp = generateOTP()
    const expiresAt = Date.now() + 10 * 60 * 1000 // 10 minutes

    // Store OTP with normalized phone number as key
    otpStore.set(normalizedPhone, { code: otp, expiresAt })
    
    console.log(`[OTP] Stored OTP for ${normalizedPhone}: ${otp}`)

    // In development, log OTP
    if (process.env.NODE_ENV === "development") {
      console.log(`[DEV] OTP for ${phoneNumber}: ${otp}`)
      return {
        success: true,
        code: otp, // Return for testing
      }
    }

    // Send via WhatsApp (use original phone number for sending)
    const message = `Your IndianKonnect verification code is: ${otp}\n\nThis code expires in 10 minutes.`
    const result = await sendWhatsAppMessage(normalizedPhone, message)

    if (!result.success) {
      otpStore.delete(normalizedPhone)
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
    // Normalize phone number
    const normalizedPhone = normalizePhoneNumber(phoneNumber)
    
    console.log(`[OTP] Verifying OTP for ${normalizedPhone}, code: ${code}`)
    console.log(`[OTP] Available keys in store:`, Array.from(otpStore.keys()))
    
    const stored = otpStore.get(normalizedPhone)

    if (!stored) {
      console.log(`[OTP] No OTP found for ${normalizedPhone}`)
      return {
        success: false,
        error: "OTP not found or expired. Please request a new OTP.",
      }
    }

    // Check expiration
    if (Date.now() > stored.expiresAt) {
      otpStore.delete(normalizedPhone)
      console.log(`[OTP] OTP expired for ${normalizedPhone}`)
      return {
        success: false,
        error: "OTP expired. Please request a new OTP.",
      }
    }

    // Verify code (trim and compare)
    const trimmedCode = code.trim()
    console.log(`[OTP] Comparing stored code "${stored.code}" with provided code "${trimmedCode}"`)
    
    if (stored.code !== trimmedCode) {
      console.log(`[OTP] Code mismatch for ${normalizedPhone}`)
      return {
        success: false,
        error: "Invalid OTP. Please check and try again.",
      }
    }

    // Remove OTP after successful verification
    otpStore.delete(normalizedPhone)
    console.log(`[OTP] Successfully verified OTP for ${normalizedPhone}`)

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
  // Normalize and remove old OTP if exists
  const normalizedPhone = normalizePhoneNumber(phoneNumber)
  otpStore.delete(normalizedPhone)
  return sendOTP(phoneNumber)
}

