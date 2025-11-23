-- ============================================
-- IndianKonnect Supabase Database Schema
-- Following PostgreSQL naming conventions
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- CITIES TABLE
-- ============================================
CREATE TABLE cities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  country_code VARCHAR(2) NOT NULL,
  flag_emoji VARCHAR(10) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT uk_cities_name_country UNIQUE (name, country_code)
);

-- ============================================
-- USERS TABLE
-- ============================================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone VARCHAR(20) NOT NULL,
  city_id UUID REFERENCES cities(id) ON DELETE SET NULL,
  is_premium BOOLEAN DEFAULT false,
  is_verified BOOLEAN DEFAULT false,
  verified_at TIMESTAMP WITH TIME ZONE,
  success_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT uk_users_phone UNIQUE (phone),
  CONSTRAINT fk_users_city FOREIGN KEY (city_id) REFERENCES cities(id) ON DELETE SET NULL
);

-- ============================================
-- POSTS TABLE
-- ============================================
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  category VARCHAR(50) NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10, 2),
  currency VARCHAR(3) DEFAULT 'INR',
  images TEXT[] DEFAULT '{}',
  city_id UUID,
  veg_only BOOLEAN DEFAULT false,
  gender_filter VARCHAR(10) DEFAULT 'both',
  is_anonymous BOOLEAN DEFAULT false,
  is_premium BOOLEAN DEFAULT false,
  is_verified_owner BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT fk_posts_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_posts_city FOREIGN KEY (city_id) REFERENCES cities(id) ON DELETE SET NULL,
  CONSTRAINT ck_posts_category CHECK (category IN (
    'room_rent', 'need_room', 'ride_share', 'deals', 
    'parcel', 'job', 'buy_sell', 'help'
  )),
  CONSTRAINT ck_posts_gender_filter CHECK (gender_filter IN ('male', 'female', 'both'))
);

-- ============================================
-- REPORTS TABLE
-- ============================================
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL,
  user_id UUID NOT NULL,
  reason TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  
  CONSTRAINT fk_reports_post FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  CONSTRAINT fk_reports_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT uk_reports_post_user UNIQUE (post_id, user_id)
);

-- ============================================
-- CHATS TABLE
-- ============================================
CREATE TABLE chats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID,
  sender_id UUID NOT NULL,
  receiver_id UUID NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT fk_chats_post FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  CONSTRAINT fk_chats_sender FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_chats_receiver FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT ck_chats_sender_receiver CHECK (sender_id != receiver_id)
);

-- ============================================
-- RATE LIMITS TABLE
-- ============================================
CREATE TABLE rate_limits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone_number VARCHAR(20) NOT NULL,
  date DATE NOT NULL,
  post_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT uk_rate_limits_phone_date UNIQUE (phone_number, date)
);

-- ============================================
-- INDEXES
-- ============================================

-- Cities indexes
CREATE INDEX idx_cities_country_code ON cities(country_code);
CREATE INDEX idx_cities_is_active ON cities(is_active);

-- Users indexes
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_city_id ON users(city_id);
CREATE INDEX idx_users_is_premium ON users(is_premium);
CREATE INDEX idx_users_is_verified ON users(is_verified);
CREATE INDEX idx_users_created_at ON users(created_at DESC);

-- Posts indexes
CREATE INDEX idx_posts_user_id ON posts(user_id);
CREATE INDEX idx_posts_city_id ON posts(city_id);
CREATE INDEX idx_posts_category ON posts(category);
CREATE INDEX idx_posts_is_active ON posts(is_active);
CREATE INDEX idx_posts_is_premium ON posts(is_premium);
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX idx_posts_price ON posts(price) WHERE price IS NOT NULL;
CREATE INDEX idx_posts_veg_only ON posts(veg_only) WHERE veg_only = true;

-- Reports indexes
CREATE INDEX idx_reports_post_id ON reports(post_id);
CREATE INDEX idx_reports_user_id ON reports(user_id);
CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_reports_created_at ON reports(created_at DESC);

-- Chats indexes
CREATE INDEX idx_chats_post_id ON chats(post_id) WHERE post_id IS NOT NULL;
CREATE INDEX idx_chats_sender_id ON chats(sender_id);
CREATE INDEX idx_chats_receiver_id ON chats(receiver_id);
CREATE INDEX idx_chats_is_read ON chats(is_read);
CREATE INDEX idx_chats_created_at ON chats(created_at DESC);
CREATE INDEX idx_chats_sender_receiver ON chats(sender_id, receiver_id);

-- Rate limits indexes
CREATE INDEX idx_rate_limits_phone_date ON rate_limits(phone_number, date);
CREATE INDEX idx_rate_limits_date ON rate_limits(date DESC);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to increment user success count
CREATE OR REPLACE FUNCTION increment_user_success_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE users 
  SET success_count = success_count + 1
  WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- TRIGGERS
-- ============================================

-- Auto-update updated_at timestamps
CREATE TRIGGER trigger_cities_updated_at 
  BEFORE UPDATE ON cities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_users_updated_at 
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_posts_updated_at 
  BEFORE UPDATE ON posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_rate_limits_updated_at 
  BEFORE UPDATE ON rate_limits
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any (for migrations)
DROP POLICY IF EXISTS "select_users_all" ON users;
DROP POLICY IF EXISTS "update_users_own" ON users;
DROP POLICY IF EXISTS "select_posts_all" ON posts;
DROP POLICY IF EXISTS "insert_posts_own" ON posts;
DROP POLICY IF EXISTS "update_posts_own" ON posts;
DROP POLICY IF EXISTS "delete_posts_own" ON posts;
DROP POLICY IF EXISTS "insert_reports_own" ON reports;
DROP POLICY IF EXISTS "select_reports_own" ON reports;
DROP POLICY IF EXISTS "select_chats_own" ON chats;
DROP POLICY IF EXISTS "insert_chats_own" ON chats;
DROP POLICY IF EXISTS "select_rate_limits_own" ON rate_limits;

-- Users policies
CREATE POLICY "select_users_all" ON users 
  FOR SELECT USING (true);

CREATE POLICY "update_users_own" ON users 
  FOR UPDATE USING (auth.uid()::text = id::text);

-- Posts policies
CREATE POLICY "select_posts_all" ON posts 
  FOR SELECT USING (is_active = true);

CREATE POLICY "insert_posts_own" ON posts 
  FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "update_posts_own" ON posts 
  FOR UPDATE USING (auth.uid()::text = user_id::text);

CREATE POLICY "delete_posts_own" ON posts 
  FOR DELETE USING (auth.uid()::text = user_id::text);

-- Reports policies
CREATE POLICY "insert_reports_own" ON reports 
  FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "select_reports_own" ON reports 
  FOR SELECT USING (auth.uid()::text = user_id::text);

-- Chats policies
CREATE POLICY "select_chats_own" ON chats 
  FOR SELECT USING (
    auth.uid()::text = sender_id::text OR 
    auth.uid()::text = receiver_id::text
  );

CREATE POLICY "insert_chats_own" ON chats 
  FOR INSERT WITH CHECK (auth.uid()::text = sender_id::text);

-- Rate limits policies
CREATE POLICY "select_rate_limits_own" ON rate_limits 
  FOR SELECT USING (true); -- Can check own rate limits

-- ============================================
-- SEED DATA
-- ============================================

-- Insert sample cities
INSERT INTO cities (name, country_code, flag_emoji) VALUES
  ('Toronto', 'CA', '🇨🇦'),
  ('Brampton', 'CA', '🇨🇦'),
  ('Mississauga', 'CA', '🇨🇦'),
  ('Vancouver', 'CA', '🇨🇦'),
  ('New Jersey', 'US', '🇺🇸'),
  ('New York', 'US', '🇺🇸'),
  ('California', 'US', '🇺🇸'),
  ('Texas', 'US', '🇺🇸'),
  ('London', 'GB', '🇬🇧'),
  ('Manchester', 'GB', '🇬🇧'),
  ('Sydney', 'AU', '🇦🇺'),
  ('Melbourne', 'AU', '🇦🇺'),
  ('Berlin', 'DE', '🇩🇪'),
  ('Munich', 'DE', '🇩🇪')
ON CONFLICT (name, country_code) DO NOTHING;
