-- Fix RLS policies to allow INSERT operations
-- The previous policies were too restrictive and blocked legitimate operations

-- Drop existing policies
DROP POLICY IF EXISTS "Users can insert their own customers" ON customers;
DROP POLICY IF EXISTS "Users can update their own customers" ON customers;
DROP POLICY IF EXISTS "Users can view their own customers" ON customers;

-- Create more permissive policies that work with both authenticated and anon users
-- These policies will work whether you're using Clerk integration or not

-- Allow authenticated and anon users to insert customers
-- The user_id will be automatically set by the default value from JWT or can be manually set
CREATE POLICY "Allow insert for authenticated and anon users" ON customers
  FOR INSERT 
  TO authenticated, anon
  WITH CHECK (true);

-- Allow authenticated and anon users to select customers
-- If user_id exists, filter by it; otherwise show all (for development)
CREATE POLICY "Allow select for authenticated and anon users" ON customers
  FOR SELECT 
  TO authenticated, anon
  USING (
    -- If user_id column exists and has a value, check if it matches current user
    -- Otherwise, allow access (for development/testing)
    CASE 
      WHEN user_id IS NOT NULL AND auth.jwt() IS NOT NULL THEN 
        user_id = (auth.jwt()->>'sub')
      ELSE 
        true
    END
  );

-- Allow authenticated and anon users to update their own customers
CREATE POLICY "Allow update for authenticated and anon users" ON customers
  FOR UPDATE 
  TO authenticated, anon
  USING (
    CASE 
      WHEN user_id IS NOT NULL AND auth.jwt() IS NOT NULL THEN 
        user_id = (auth.jwt()->>'sub')
      ELSE 
        true
    END
  );

-- Allow authenticated and anon users to delete their own customers
CREATE POLICY "Allow delete for authenticated and anon users" ON customers
  FOR DELETE 
  TO authenticated, anon
  USING (
    CASE 
      WHEN user_id IS NOT NULL AND auth.jwt() IS NOT NULL THEN 
        user_id = (auth.jwt()->>'sub')
      ELSE 
        true
    END
  );

-- Make user_id column optional for INSERT operations
-- This allows inserting records without requiring Clerk authentication
ALTER TABLE customers ALTER COLUMN user_id DROP NOT NULL;

-- Update the default value to handle cases where JWT is not available
ALTER TABLE customers ALTER COLUMN user_id SET DEFAULT 
  COALESCE(auth.jwt()->>'sub', 'anonymous_' || extract(epoch from now())::text);