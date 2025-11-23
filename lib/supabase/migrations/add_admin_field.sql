-- Migration: Add is_admin field to users table
-- Run this in your Supabase SQL Editor

-- Add is_admin column if it doesn't exist
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

-- Create index for admin users
CREATE INDEX IF NOT EXISTS idx_users_is_admin ON users(is_admin);

-- Example: Set yourself as admin (replace with your phone number)
-- UPDATE users SET is_admin = true WHERE phone = '+1234567890';

