-- Temporarily disable RLS on customers table for development
-- This allows full access to the customers table without authentication restrictions
-- IMPORTANT: This is for development only - re-enable RLS for production

-- Disable RLS on customers table
ALTER TABLE customers DISABLE ROW LEVEL SECURITY;

-- Drop all existing RLS policies since they won't be used
DROP POLICY IF EXISTS "Users can insert their own customers" ON customers;
DROP POLICY IF EXISTS "Users can update their own customers" ON customers;
DROP POLICY IF EXISTS "Users can view their own customers" ON customers;
DROP POLICY IF EXISTS "Allow insert for authenticated and anon users" ON customers;
DROP POLICY IF EXISTS "Allow select for authenticated and anon users" ON customers;
DROP POLICY IF EXISTS "Allow update for authenticated and anon users" ON customers;
DROP POLICY IF EXISTS "Allow delete for authenticated and anon users" ON customers;

-- Make user_id column nullable and optional
ALTER TABLE customers ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE customers ALTER COLUMN user_id DROP DEFAULT;

-- Grant full access to authenticated and anon users
GRANT ALL ON customers TO authenticated, anon;

-- Add a comment to remind this is temporary
COMMENT ON TABLE customers IS 'RLS temporarily disabled for development. Re-enable for production.';

-- Optional: Create some test data
INSERT INTO customers (name, phone, shipping_addr_1, postal_code, shopify_customer_id) VALUES
  ('Test Customer 1', '+65 1234 5678', '123 Main Street', '123456', 'shopify_test_1'),
  ('Test Customer 2', '+65 8765 4321', '456 Oak Avenue', '654321', 'shopify_test_2'),
  ('Demo Customer', '+65 5555 0000', '789 Pine Road', '789012', 'shopify_demo_1')
ON CONFLICT DO NOTHING;