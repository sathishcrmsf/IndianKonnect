/**
 * Post data validation service
 * Validates post data before database insertion
 */

const ALLOWED_CATEGORIES = [
  'room_rent',
  'need_room',
  'ride_share',
  'deals',
  'parcel',
  'job',
  'buy_sell',
  'help',
] as const

const ALLOWED_GENDER_FILTERS = ['male', 'female', 'both'] as const

const ALLOWED_CURRENCIES = ['INR', 'USD', 'CAD', 'GBP', 'AUD', 'EUR'] as const

export interface ValidationResult {
  valid: boolean
  errors: string[]
}

export interface PostData {
  category: string
  title: string
  description: string
  price?: number | null
  currency?: string
  gender_filter?: string
}

/**
 * Validate post data
 */
export function validatePostData(data: PostData): ValidationResult {
  const errors: string[] = []

  // Validate category
  if (!data.category || !ALLOWED_CATEGORIES.includes(data.category as any)) {
    errors.push(
      `Invalid category. Must be one of: ${ALLOWED_CATEGORIES.join(', ')}`
    )
  }

  // Validate title
  if (!data.title || data.title.trim().length === 0) {
    errors.push('Title is required')
  } else if (data.title.length > 200) {
    errors.push('Title must be 200 characters or less')
  } else if (data.title.length < 3) {
    errors.push('Title must be at least 3 characters')
  }

  // Validate description
  if (!data.description || data.description.trim().length === 0) {
    errors.push('Description is required')
  } else if (data.description.length < 10) {
    errors.push('Description must be at least 10 characters')
  }

  // Validate price (if provided)
  // DECIMAL(10, 2) allows max value of 99,999,999.99
  const MAX_PRICE = 99999999.99
  if (data.price !== null && data.price !== undefined) {
    if (typeof data.price !== 'number' || isNaN(data.price)) {
      errors.push('Price must be a valid number')
    } else if (data.price < 0) {
      errors.push('Price cannot be negative')
    } else if (data.price > MAX_PRICE) {
      errors.push(`Price cannot exceed ${MAX_PRICE.toLocaleString()}`)
    }
  }

  // Validate currency
  if (data.currency && !ALLOWED_CURRENCIES.includes(data.currency as any)) {
    errors.push(
      `Invalid currency. Must be one of: ${ALLOWED_CURRENCIES.join(', ')}`
    )
  }

  // Validate gender filter
  if (
    data.gender_filter &&
    !ALLOWED_GENDER_FILTERS.includes(data.gender_filter as any)
  ) {
    errors.push(
      `Invalid gender filter. Must be one of: ${ALLOWED_GENDER_FILTERS.join(', ')}`
    )
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

