/**
 * Phone number normalization utility
 * Ensures consistent phone number formatting across the application
 */

/**
 * Normalize phone number to consistent format
 * - Removes spaces, dashes, parentheses
 * - Ensures it starts with +
 * - Handles international formats
 */
export function normalizePhoneNumber(phone: string): string {
  // Remove all spaces, dashes, and parentheses
  let normalized = phone.replace(/[\s\-\(\)]/g, '')
  
  // Remove @c.us suffix if present (from WhatsApp)
  normalized = normalized.replace('@c.us', '')
  
  // Remove whatsapp: prefix if present
  normalized = normalized.replace(/^whatsapp:/i, '')
  
  // Ensure it starts with +
  if (!normalized.startsWith('+')) {
    // If it doesn't start with +, add it
    normalized = '+' + normalized
  }
  
  return normalized
}

/**
 * Format phone number for display
 */
export function formatPhoneNumber(phone: string): string {
  const normalized = normalizePhoneNumber(phone)
  // Add spacing for readability (optional)
  return normalized
}

