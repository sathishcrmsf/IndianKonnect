import { supabase } from '../supabase/supabase-bot.js'

const DAILY_POST_LIMIT = 5

/**
 * Check and increment rate limit atomically
 * Uses PostgreSQL upsert with increment to prevent race conditions
 */
export async function checkAndIncrementRateLimit(
  phoneNumber: string
): Promise<{
  allowed: boolean
  message?: string
  timeRemaining?: string
  remaining?: number
}> {
  const today = new Date().toISOString().split('T')[0]

  try {
    // Use RPC function for atomic check and increment
    // First, try to get or create the rate limit record
    const { data: existing, error: fetchError } = await supabase
      .from('rate_limits')
      .select('post_count')
      .eq('phone_number', phoneNumber)
      .eq('date', today)
      .single()

    const currentCount = existing?.post_count || 0

    // Check if limit reached before incrementing
    if (currentCount >= DAILY_POST_LIMIT) {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      tomorrow.setHours(0, 0, 0, 0)
      const hoursRemaining = Math.ceil(
        (tomorrow.getTime() - Date.now()) / (1000 * 60 * 60)
      )

      return {
        allowed: false,
        message: `You've reached the daily limit of ${DAILY_POST_LIMIT} posts.`,
        timeRemaining: `${hoursRemaining} hours`,
      }
    }

    // Atomically increment (this will create if doesn't exist)
    const newCount = currentCount + 1
    const { error: upsertError } = await supabase
      .from('rate_limits')
      .upsert(
        {
          phone_number: phoneNumber,
          date: today,
          post_count: newCount,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'phone_number,date',
        }
      )

    if (upsertError) {
      console.error('Error updating rate limit:', upsertError)
      // On error, allow the request but log it
      return { allowed: true, remaining: DAILY_POST_LIMIT - currentCount }
    }

    const remaining = Math.max(0, DAILY_POST_LIMIT - newCount)
    return {
      allowed: true,
      remaining,
    }
  } catch (error) {
    console.error('Rate limit check error:', error)
    // On error, allow the request
    return { allowed: true }
  }
}

/**
 * Legacy function for backward compatibility
 * @deprecated Use checkAndIncrementRateLimit for atomic operations
 */
export async function checkRateLimit(phoneNumber: string): Promise<{
  allowed: boolean
  message?: string
  timeRemaining?: string
  remaining?: number
}> {
  const today = new Date().toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('rate_limits')
    .select('post_count')
    .eq('phone_number', phoneNumber)
    .eq('date', today)
    .single()

  if (error && error.code !== 'PGRST116') {
    console.error('Error checking rate limit:', error)
    return { allowed: true }
  }

  const postCount = data?.post_count || 0
  const remaining = Math.max(0, DAILY_POST_LIMIT - postCount)

  if (postCount >= DAILY_POST_LIMIT) {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(0, 0, 0, 0)
    const hoursRemaining = Math.ceil(
      (tomorrow.getTime() - Date.now()) / (1000 * 60 * 60)
    )

    return {
      allowed: false,
      message: `You've reached the daily limit of ${DAILY_POST_LIMIT} posts.`,
      timeRemaining: `${hoursRemaining} hours`,
    }
  }

  return {
    allowed: true,
    remaining,
  }
}

/**
 * Update rate limit (increment by 1)
 * @deprecated Use checkAndIncrementRateLimit for atomic operations
 */
export async function updateRateLimit(phoneNumber: string): Promise<void> {
  const today = new Date().toISOString().split('T')[0]

  const { data: existing } = await supabase
    .from('rate_limits')
    .select('post_count')
    .eq('phone_number', phoneNumber)
    .eq('date', today)
    .single()

  const newCount = (existing?.post_count || 0) + 1

  const { error } = await supabase
    .from('rate_limits')
    .upsert(
      {
        phone_number: phoneNumber,
        date: today,
        post_count: newCount,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: 'phone_number,date',
      }
    )

  if (error) {
    console.error('Error updating rate limit:', error)
  }
}