/**
 * Input sanitization utility
 * Sanitizes user input from WhatsApp messages and other sources
 */

const MAX_MESSAGE_LENGTH = 5000
const MAX_TITLE_LENGTH = 200
const MAX_DESCRIPTION_LENGTH = 5000

/**
 * Sanitize text input
 * - Removes potentially harmful characters
 * - Trims whitespace
 * - Limits length
 */
export function sanitizeText(
  text: string,
  maxLength: number = MAX_MESSAGE_LENGTH
): string {
  if (!text || typeof text !== 'string') {
    return ''
  }

  // Trim whitespace
  let sanitized = text.trim()

  // Remove null bytes and control characters (except newlines and tabs)
  sanitized = sanitized.replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, '')

  // Limit length
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength)
  }

  return sanitized
}

/**
 * Sanitize message text from WhatsApp
 */
export function sanitizeMessage(text: string): string {
  return sanitizeText(text, MAX_MESSAGE_LENGTH)
}

/**
 * Sanitize post title
 */
export function sanitizeTitle(text: string): string {
  return sanitizeText(text, MAX_TITLE_LENGTH)
}

/**
 * Sanitize post description
 */
export function sanitizeDescription(text: string): string {
  return sanitizeText(text, MAX_DESCRIPTION_LENGTH)
}

/**
 * Remove HTML tags (basic protection)
 */
export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '')
}

/**
 * Sanitize phone number (basic validation)
 */
export function sanitizePhoneNumber(phone: string): string {
  // Remove all non-digit and non-plus characters
  return phone.replace(/[^\d+]/g, '')
}

