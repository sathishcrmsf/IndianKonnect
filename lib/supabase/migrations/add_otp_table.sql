-- Migration: Add OTP verifications table
-- Run this in your Supabase SQL Editor

-- Create OTP verifications table
CREATE TABLE IF NOT EXISTS otp_verifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone_number VARCHAR(20) NOT NULL,
  code VARCHAR(6) NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_otp_phone_number ON otp_verifications(phone_number);
CREATE INDEX IF NOT EXISTS idx_otp_expires_at ON otp_verifications(expires_at);
CREATE INDEX IF NOT EXISTS idx_otp_verified ON otp_verifications(verified);

-- Create partial unique index for unverified OTPs (one active OTP per phone)
CREATE UNIQUE INDEX IF NOT EXISTS uk_otp_phone_active ON otp_verifications(phone_number) 
  WHERE verified = false;

-- Enable RLS
ALTER TABLE otp_verifications ENABLE ROW LEVEL SECURITY;

-- Create policies
DROP POLICY IF EXISTS "select_otp_all" ON otp_verifications;
DROP POLICY IF EXISTS "insert_otp_all" ON otp_verifications;
DROP POLICY IF EXISTS "update_otp_all" ON otp_verifications;

CREATE POLICY "select_otp_all" ON otp_verifications 
  FOR SELECT USING (true);

CREATE POLICY "insert_otp_all" ON otp_verifications 
  FOR INSERT WITH CHECK (true);

CREATE POLICY "update_otp_all" ON otp_verifications 
  FOR UPDATE USING (true);

