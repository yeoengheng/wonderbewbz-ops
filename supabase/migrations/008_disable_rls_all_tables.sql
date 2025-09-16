-- Disable RLS on all tables for development
-- This allows full access to all tables without authentication restrictions
-- IMPORTANT: This is for development only - re-enable RLS for production

-- Disable RLS on all tables
ALTER TABLE customers DISABLE ROW LEVEL SECURITY;
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE machine_runs DISABLE ROW LEVEL SECURITY;
ALTER TABLE individual_bags DISABLE ROW LEVEL SECURITY;

-- Drop all existing RLS policies on customers table
DROP POLICY IF EXISTS "Users can insert their own customers" ON customers;
DROP POLICY IF EXISTS "Users can update their own customers" ON customers;
DROP POLICY IF EXISTS "Users can view their own customers" ON customers;
DROP POLICY IF EXISTS "Allow insert for authenticated and anon users" ON customers;
DROP POLICY IF EXISTS "Allow select for authenticated and anon users" ON customers;
DROP POLICY IF EXISTS "Allow update for authenticated and anon users" ON customers;
DROP POLICY IF EXISTS "Allow delete for authenticated and anon users" ON customers;

-- Drop all existing RLS policies on orders table
DROP POLICY IF EXISTS "Users can insert their own orders" ON orders;
DROP POLICY IF EXISTS "Users can update their own orders" ON orders;
DROP POLICY IF EXISTS "Users can view their own orders" ON orders;
DROP POLICY IF EXISTS "Allow insert for authenticated and anon users" ON orders;
DROP POLICY IF EXISTS "Allow select for authenticated and anon users" ON orders;
DROP POLICY IF EXISTS "Allow update for authenticated and anon users" ON orders;
DROP POLICY IF EXISTS "Allow delete for authenticated and anon users" ON orders;

-- Drop all existing RLS policies on machine_runs table
DROP POLICY IF EXISTS "Users can insert their own machine_runs" ON machine_runs;
DROP POLICY IF EXISTS "Users can update their own machine_runs" ON machine_runs;
DROP POLICY IF EXISTS "Users can view their own machine_runs" ON machine_runs;
DROP POLICY IF EXISTS "Allow insert for authenticated and anon users" ON machine_runs;
DROP POLICY IF EXISTS "Allow select for authenticated and anon users" ON machine_runs;
DROP POLICY IF EXISTS "Allow update for authenticated and anon users" ON machine_runs;
DROP POLICY IF EXISTS "Allow delete for authenticated and anon users" ON machine_runs;

-- Drop all existing RLS policies on individual_bags table
DROP POLICY IF EXISTS "Users can insert their own individual_bags" ON individual_bags;
DROP POLICY IF EXISTS "Users can update their own individual_bags" ON individual_bags;
DROP POLICY IF EXISTS "Users can view their own individual_bags" ON individual_bags;
DROP POLICY IF EXISTS "Allow insert for authenticated and anon users" ON individual_bags;
DROP POLICY IF EXISTS "Allow select for authenticated and anon users" ON individual_bags;
DROP POLICY IF EXISTS "Allow update for authenticated and anon users" ON individual_bags;
DROP POLICY IF EXISTS "Allow delete for authenticated and anon users" ON individual_bags;

-- Make user_id columns nullable and optional on all tables
ALTER TABLE customers ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE customers ALTER COLUMN user_id DROP DEFAULT;
ALTER TABLE orders ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE orders ALTER COLUMN user_id DROP DEFAULT;
ALTER TABLE machine_runs ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE machine_runs ALTER COLUMN user_id DROP DEFAULT;
ALTER TABLE individual_bags ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE individual_bags ALTER COLUMN user_id DROP DEFAULT;

-- Grant full access to authenticated and anon users on all tables
GRANT ALL ON customers TO authenticated, anon;
GRANT ALL ON orders TO authenticated, anon;
GRANT ALL ON machine_runs TO authenticated, anon;
GRANT ALL ON individual_bags TO authenticated, anon;

-- Add comments to remind this is temporary
COMMENT ON TABLE customers IS 'RLS temporarily disabled for development. Re-enable for production.';
COMMENT ON TABLE orders IS 'RLS temporarily disabled for development. Re-enable for production.';
COMMENT ON TABLE machine_runs IS 'RLS temporarily disabled for development. Re-enable for production.';
COMMENT ON TABLE individual_bags IS 'RLS temporarily disabled for development. Re-enable for production.';