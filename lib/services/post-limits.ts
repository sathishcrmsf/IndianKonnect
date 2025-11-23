/**
 * Service to check and track post limits
 * First 100 posts are free, then only Premium users can auto-post
 */

import { supabase } from "@/lib/supabase/client"

const FREE_POST_LIMIT = 100

export async function canUserPost(userId: string): Promise<{
  canPost: boolean
  reason?: string
  freePostsRemaining?: number
}> {
  try {
    // Get total posts count
    const { count, error: countError } = await supabase
      .from("posts")
      .select("*", { count: "exact", head: true })

    if (countError) {
      console.error("Error counting posts:", countError)
      return { canPost: false, reason: "Database error" }
    }

    const totalPosts = count || 0

    // If under free limit, anyone can post
    if (totalPosts < FREE_POST_LIMIT) {
      return {
        canPost: true,
        freePostsRemaining: FREE_POST_LIMIT - totalPosts,
      }
    }

    // After free limit, check if user is premium
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("is_premium")
      .eq("id", userId)
      .single()

    if (userError || !user) {
      return { canPost: false, reason: "User not found" }
    }

    if (user.is_premium) {
      return { canPost: true }
    }

    return {
      canPost: false,
      reason: "Free posts limit reached. Upgrade to Premium to continue posting.",
    }
  } catch (error) {
    console.error("Error checking post limits:", error)
    return { canPost: false, reason: "System error" }
  }
}
