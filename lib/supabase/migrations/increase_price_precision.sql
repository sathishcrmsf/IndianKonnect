-- Increase price precision to support larger values
-- DECIMAL(10, 2) = max 99,999,999.99
-- DECIMAL(12, 2) = max 9,999,999,999.99 (almost 10 billion)
-- This allows for larger prices in various currencies (e.g., high-value items, luxury rentals)

-- Alter posts table price column
ALTER TABLE posts 
  ALTER COLUMN price TYPE DECIMAL(12, 2);

-- Alter payments table amount column (for consistency)
ALTER TABLE payments 
  ALTER COLUMN amount TYPE DECIMAL(12, 2);

-- Note: This migration is optional. DECIMAL(10, 2) should be sufficient for most use cases.
-- Only run this if you need to support prices above 99,999,999.99

