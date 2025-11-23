/**
 * OTP service for phone verification via WhatsApp
 * Uses whatsapp-web.js bot to send OTP codes
 * Stores OTPs in Supabase database for persistence
 */

import { sendWhatsAppMessage } from "./whatsapp"
import { supabase } from "@/lib/supabase/client"
import { normalizePhoneNumber } from "@/lib/utils/phone"

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
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    // Delete any existing unverified OTPs for this phone number
    // This ensures we only have one active OTP per phone number
    await supabase
      .from("otp_verifications")
      .delete()
      .eq("phone_number", normalizedPhone)
      .eq("verified", false)

    // Store OTP in database
    const { error: dbError } = await supabase
      .from("otp_verifications")
      .insert({
        phone_number: normalizedPhone,
        code: otp,
        expires_at: expiresAt.toISOString(),
        verified: false,
      })

    if (dbError) {
      console.error("Database error storing OTP:", dbError)
      return {
        success: false,
        error: "Failed to store OTP. Please try again.",
      }
    }
    
    console.log(`[OTP] Stored OTP for ${normalizedPhone}: ${otp}`)

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
    const result = await sendWhatsAppMessage(normalizedPhone, message)

    if (!result.success) {
      // Delete from database if send failed
      await supabase
        .from("otp_verifications")
        .delete()
        .eq("phone_number", normalizedPhone)
        .eq("code", otp)
        .eq("verified", false)
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
    const trimmedCode = code.trim()
    
    console.log(`[OTP] Verifying OTP for ${normalizedPhone}, code: ${trimmedCode}`)
    
    // Try database first
    const { data: otpData, error: dbError } = await supabase
      .from("otp_verifications")
      .select("*")
      .eq("phone_number", normalizedPhone)
      .eq("verified", false)
      .order("created_at", { ascending: false })
      .limit(1)
      .single()

    let stored: { code: string; expiresAt: number } | null = null

    if (!dbError && otpData) {
      // Check expiration
      const expiresAt = new Date(otpData.expires_at).getTime()
      if (Date.now() > expiresAt) {
        // Mark as verified (expired)
        await supabase
          .from("otp_verifications")
          .update({ verified: true })
          .eq("id", otpData.id)
        
        console.log(`[OTP] OTP expired for ${normalizedPhone}`)
        return {
          success: false,
          error: "OTP expired. Please request a new OTP.",
        }
      }

      stored = { code: otpData.code, expiresAt }
    }

    if (!stored) {
      console.log(`[OTP] No OTP found for ${normalizedPhone}`)
      return {
        success: false,
        error: "OTP not found or expired. Please request a new OTP.",
      }
    }

    // Verify code
    console.log(`[OTP] Comparing stored code "${stored.code}" with provided code "${trimmedCode}"`)
    
    if (stored.code !== trimmedCode) {
      console.log(`[OTP] Code mismatch for ${normalizedPhone}`)
      return {
        success: false,
        error: "Invalid OTP. Please check and try again.",
      }
    }

    // Mark as verified in database
    if (otpData) {
      await supabase
        .from("otp_verifications")
        .update({ verified: true })
        .eq("id", otpData.id)
    }
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
  // Normalize and invalidate old OTPs
  const normalizedPhone = normalizePhoneNumber(phoneNumber)
  
  // Mark existing OTPs as verified (invalidate them)
  await supabase
    .from("otp_verifications")
    .update({ verified: true })
    .eq("phone_number", normalizedPhone)
    .eq("verified", false)
  return sendOTP(phoneNumber)
}

