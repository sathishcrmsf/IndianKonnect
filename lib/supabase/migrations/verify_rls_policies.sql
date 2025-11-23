-- Verify RLS policies are correctly configured
-- Run this after applying all migrations to ensure policies work correctly

-- ============================================
-- VERIFY POSTS TABLE POLICIES
-- ============================================

-- Check that posts can be inserted with anon key (for bot)
-- This should work: INSERT INTO posts (...) VALUES (...)
-- Note: Run this test manually in Supabase SQL editor with anon key

-- Verify SELECT policy allows reading active posts
-- SELECT * FROM posts WHERE is_active = true; -- Should work

-- Verify INSERT policy allows service role (anon key with null auth.uid)
-- INSERT INTO posts (...) VALUES (...); -- Should work with anon key

-- ============================================
-- VERIFY RATE_LIMITS TABLE POLICIES
-- ============================================

-- Check that rate_limits can be read/written with anon key
-- SELECT * FROM rate_limits WHERE phone_number = '+1234567890'; -- Should work
-- INSERT INTO rate_limits (...) VALUES (...); -- Should work
-- UPDATE rate_limits SET post_count = 1 WHERE phone_number = '+1234567890'; -- Should work

-- ============================================
-- VERIFY USERS TABLE POLICIES
-- ============================================

-- Check that users can be created with anon key
-- INSERT INTO users (phone) VALUES ('+1234567890'); -- Should work

-- Check that users can be read
-- SELECT * FROM users; -- Should work

-- ============================================
-- VERIFY OTP_VERIFICATIONS TABLE POLICIES
-- ============================================

-- Check that OTPs can be created and read with anon key
-- INSERT INTO otp_verifications (...) VALUES (...); -- Should work
-- SELECT * FROM otp_verifications WHERE phone_number = '+1234567890'; -- Should work
-- UPDATE otp_verifications SET verified = true WHERE id = '...'; -- Should work

-- ============================================
-- SUMMARY
-- ============================================
-- All policies should allow:
-- 1. Bot operations (using anon key with null auth.uid)
-- 2. Public read operations where appropriate
-- 3. User creation for new accounts
-- 4. Rate limit tracking

-- If any of these fail, check the RLS policies in schema.sql

