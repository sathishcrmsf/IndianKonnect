import { supabase } from '../supabase/supabase-bot.js'

const DAILY_POST_LIMIT = 5

export async function checkRateLimit(phoneNumber: string): Promise<{
  allowed: boolean
  message?: string
  timeRemaining?: string
  remaining?: number
}> {
  const today = new Date().toISOString().split('T')[0]

  // Get today's post count
  const { data, error } = await supabase
    .from('rate_limits')
    .select('post_count')
    .eq('phone_number', phoneNumber)
    .eq('date', today)
    .single()

  if (error && error.code !== 'PGRST116') {
    // PGRST116 = no rows returned, which is fine
    console.error('Error checking rate limit:', error)
    return { allowed: true } // Allow on error
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

export async function updateRateLimit(phoneNumber: string): Promise<void> {
  const today = new Date().toISOString().split('T')[0]

  // Get current count
  const { data: existing } = await supabase
    .from('rate_limits')
    .select('post_count')
    .eq('phone_number', phoneNumber)
    .eq('date', today)
    .single()

  const newCount = (existing?.post_count || 0) + 1

  const { error } = await supabase
    .from('rate_limits')
    .upsert({
      phone_number: phoneNumber,
      date: today,
      post_count: newCount,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'phone_number,date',
    })

  if (error) {
    console.error('Error updating rate limit:', error)
  }
}