-- Fix: Add INSERT policy for users table to allow OTP-verified user creation
-- Run this in your Supabase SQL Editor

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "insert_users_all" ON users;

-- Create INSERT policy to allow user creation (OTP verified via API)
CREATE POLICY "insert_users_all" ON users 
  FOR INSERT WITH CHECK (true);

-- Also update the update policy to be less restrictive (application will handle auth)
DROP POLICY IF EXISTS "update_users_own" ON users;

CREATE POLICY "update_users_own" ON users 
  FOR UPDATE USING (true);

