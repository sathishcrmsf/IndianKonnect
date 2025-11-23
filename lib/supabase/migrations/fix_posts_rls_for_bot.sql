-- Fix RLS policies to allow WhatsApp bot to create posts and update rate limits
-- The bot uses anon key without authenticated user context

-- ============================================
-- POSTS TABLE POLICIES
-- ============================================

-- Drop the existing insert policy
DROP POLICY IF EXISTS "insert_posts_own" ON posts;

-- Create a new policy that allows:
-- 1. Authenticated users to insert their own posts (auth.uid() = user_id)
-- 2. Service role/anon key to insert posts (auth.uid() is null)
CREATE POLICY "insert_posts_own" ON posts 
  FOR INSERT WITH CHECK (
    auth.uid()::text = user_id::text OR 
    auth.uid() IS NULL
  );

-- Also allow service role to update/delete posts (for bot operations)
DROP POLICY IF EXISTS "update_posts_own" ON posts;
CREATE POLICY "update_posts_own" ON posts 
  FOR UPDATE USING (
    auth.uid()::text = user_id::text OR 
    auth.uid() IS NULL
  );

DROP POLICY IF EXISTS "delete_posts_own" ON posts;
CREATE POLICY "delete_posts_own" ON posts 
  FOR DELETE USING (
    auth.uid()::text = user_id::text OR 
    auth.uid() IS NULL
  );

-- ============================================
-- RATE LIMITS TABLE POLICIES
-- ============================================

-- Allow service role (anon key) to insert and update rate limits (needed for WhatsApp bot)
DROP POLICY IF EXISTS "insert_rate_limits_all" ON rate_limits;
CREATE POLICY "insert_rate_limits_all" ON rate_limits 
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "update_rate_limits_all" ON rate_limits;
CREATE POLICY "update_rate_limits_all" ON rate_limits 
  FOR UPDATE USING (true);

