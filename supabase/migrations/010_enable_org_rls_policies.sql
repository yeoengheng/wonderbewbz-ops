-- Enable Row Level Security with Organization-based policies
-- This migration enables RLS and creates policies for multi-tenant data isolation using Clerk org_id

-- Create a function to get the current org_id from JWT
CREATE OR REPLACE FUNCTION public.get_current_org_id()
RETURNS TEXT AS $$
  SELECT COALESCE(
    NULLIF(current_setting('request.jwt.claims', true)::json->>'org_id', ''),
    NULLIF(current_setting('request.jwt.claim.org_id', true), '')
  )
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- Set default org_id to use the function
ALTER TABLE customers ALTER COLUMN org_id SET DEFAULT public.get_current_org_id();
ALTER TABLE orders ALTER COLUMN org_id SET DEFAULT public.get_current_org_id();
ALTER TABLE machine_runs ALTER COLUMN org_id SET DEFAULT public.get_current_org_id();
ALTER TABLE cross_checks ALTER COLUMN org_id SET DEFAULT public.get_current_org_id();

-- Enable RLS on all tables
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE machine_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE individual_bags ENABLE ROW LEVEL SECURITY;
ALTER TABLE cross_checks ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies from previous attempts
DROP POLICY IF EXISTS "Users can view their own customers" ON customers;
DROP POLICY IF EXISTS "Users can insert their own customers" ON customers;
DROP POLICY IF EXISTS "Users can update their own customers" ON customers;
DROP POLICY IF EXISTS "Allow insert for authenticated and anon users" ON customers;
DROP POLICY IF EXISTS "Allow select for authenticated and anon users" ON customers;
DROP POLICY IF EXISTS "Allow update for authenticated and anon users" ON customers;
DROP POLICY IF EXISTS "Allow delete for authenticated and anon users" ON customers;

DROP POLICY IF EXISTS "Users can view their own orders" ON orders;
DROP POLICY IF EXISTS "Users can insert their own orders" ON orders;
DROP POLICY IF EXISTS "Users can update their own orders" ON orders;
DROP POLICY IF EXISTS "Allow insert for authenticated and anon users" ON orders;
DROP POLICY IF EXISTS "Allow select for authenticated and anon users" ON orders;
DROP POLICY IF EXISTS "Allow update for authenticated and anon users" ON orders;
DROP POLICY IF EXISTS "Allow delete for authenticated and anon users" ON orders;

DROP POLICY IF EXISTS "Users can view their own machine runs" ON machine_runs;
DROP POLICY IF EXISTS "Users can insert their own machine runs" ON machine_runs;
DROP POLICY IF EXISTS "Users can update their own machine runs" ON machine_runs;
DROP POLICY IF EXISTS "Allow insert for authenticated and anon users" ON machine_runs;
DROP POLICY IF EXISTS "Allow select for authenticated and anon users" ON machine_runs;
DROP POLICY IF EXISTS "Allow update for authenticated and anon users" ON machine_runs;
DROP POLICY IF EXISTS "Allow delete for authenticated and anon users" ON machine_runs;

DROP POLICY IF EXISTS "Users can view bags from their machine runs" ON individual_bags;
DROP POLICY IF EXISTS "Users can insert bags to their machine runs" ON individual_bags;
DROP POLICY IF EXISTS "Users can update bags from their machine runs" ON individual_bags;
DROP POLICY IF EXISTS "Allow insert for authenticated and anon users" ON individual_bags;
DROP POLICY IF EXISTS "Allow select for authenticated and anon users" ON individual_bags;
DROP POLICY IF EXISTS "Allow update for authenticated and anon users" ON individual_bags;
DROP POLICY IF EXISTS "Allow delete for authenticated and anon users" ON individual_bags;

-- ============================================================================
-- CUSTOMERS TABLE - Organization-based RLS Policies
-- ============================================================================

CREATE POLICY "Organizations can view their own customers"
ON customers
FOR SELECT
TO authenticated
USING (
  org_id = public.get_current_org_id()
);

CREATE POLICY "Organizations can insert their own customers"
ON customers
FOR INSERT
TO authenticated
WITH CHECK (
  org_id = public.get_current_org_id()
);

CREATE POLICY "Organizations can update their own customers"
ON customers
FOR UPDATE
TO authenticated
USING (
  org_id = public.get_current_org_id()
)
WITH CHECK (
  org_id = public.get_current_org_id()
);

CREATE POLICY "Organizations can delete their own customers"
ON customers
FOR DELETE
TO authenticated
USING (
  org_id = public.get_current_org_id()
);

-- ============================================================================
-- ORDERS TABLE - Organization-based RLS Policies
-- ============================================================================

CREATE POLICY "Organizations can view their own orders"
ON orders
FOR SELECT
TO authenticated
USING (
  org_id = public.get_current_org_id()
);

CREATE POLICY "Organizations can insert their own orders"
ON orders
FOR INSERT
TO authenticated
WITH CHECK (
  org_id = public.get_current_org_id()
);

CREATE POLICY "Organizations can update their own orders"
ON orders
FOR UPDATE
TO authenticated
USING (
  org_id = public.get_current_org_id()
)
WITH CHECK (
  org_id = public.get_current_org_id()
);

CREATE POLICY "Organizations can delete their own orders"
ON orders
FOR DELETE
TO authenticated
USING (
  org_id = public.get_current_org_id()
);

-- ============================================================================
-- MACHINE_RUNS TABLE - Organization-based RLS Policies
-- ============================================================================

CREATE POLICY "Organizations can view their own machine runs"
ON machine_runs
FOR SELECT
TO authenticated
USING (
  org_id = public.get_current_org_id()
);

CREATE POLICY "Organizations can insert their own machine runs"
ON machine_runs
FOR INSERT
TO authenticated
WITH CHECK (
  org_id = public.get_current_org_id()
);

CREATE POLICY "Organizations can update their own machine runs"
ON machine_runs
FOR UPDATE
TO authenticated
USING (
  org_id = public.get_current_org_id()
)
WITH CHECK (
  org_id = public.get_current_org_id()
);

CREATE POLICY "Organizations can delete their own machine runs"
ON machine_runs
FOR DELETE
TO authenticated
USING (
  org_id = public.get_current_org_id()
);

-- ============================================================================
-- INDIVIDUAL_BAGS TABLE - Inherits org access from parent machine_run
-- ============================================================================

CREATE POLICY "Organizations can view bags from their machine runs"
ON individual_bags
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM machine_runs
    WHERE machine_runs.machine_run_id = individual_bags.machine_run_id
    AND machine_runs.org_id = public.get_current_org_id()
  )
);

CREATE POLICY "Organizations can insert bags to their machine runs"
ON individual_bags
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM machine_runs
    WHERE machine_runs.machine_run_id = individual_bags.machine_run_id
    AND machine_runs.org_id = public.get_current_org_id()
  )
);

CREATE POLICY "Organizations can update bags from their machine runs"
ON individual_bags
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM machine_runs
    WHERE machine_runs.machine_run_id = individual_bags.machine_run_id
    AND machine_runs.org_id = public.get_current_org_id()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM machine_runs
    WHERE machine_runs.machine_run_id = individual_bags.machine_run_id
    AND machine_runs.org_id = public.get_current_org_id()
  )
);

CREATE POLICY "Organizations can delete bags from their machine runs"
ON individual_bags
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM machine_runs
    WHERE machine_runs.machine_run_id = individual_bags.machine_run_id
    AND machine_runs.org_id = public.get_current_org_id()
  )
);

-- ============================================================================
-- CROSS_CHECKS TABLE - Organization-based RLS Policies
-- ============================================================================

CREATE POLICY "Organizations can view their own cross checks"
ON cross_checks
FOR SELECT
TO authenticated
USING (
  org_id = public.get_current_org_id()
);

CREATE POLICY "Organizations can insert their own cross checks"
ON cross_checks
FOR INSERT
TO authenticated
WITH CHECK (
  org_id = public.get_current_org_id()
);

CREATE POLICY "Organizations can update their own cross checks"
ON cross_checks
FOR UPDATE
TO authenticated
USING (
  org_id = public.get_current_org_id()
)
WITH CHECK (
  org_id = public.get_current_org_id()
);

CREATE POLICY "Organizations can delete their own cross checks"
ON cross_checks
FOR DELETE
TO authenticated
USING (
  org_id = public.get_current_org_id()
);

-- Revoke direct grants from previous migrations and rely on RLS
REVOKE ALL ON customers FROM authenticated, anon;
REVOKE ALL ON orders FROM authenticated, anon;
REVOKE ALL ON machine_runs FROM authenticated, anon;
REVOKE ALL ON individual_bags FROM authenticated, anon;
REVOKE ALL ON cross_checks FROM authenticated, anon;

-- Grant necessary table-level permissions (RLS will handle row-level access)
GRANT SELECT, INSERT, UPDATE, DELETE ON customers TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON orders TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON machine_runs TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON individual_bags TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON cross_checks TO authenticated;

-- Update table comments to reflect organization-based RLS
COMMENT ON TABLE customers IS 'Organization-based RLS enabled. Users can only access data from their Clerk organization.';
COMMENT ON TABLE orders IS 'Organization-based RLS enabled. Users can only access data from their Clerk organization.';
COMMENT ON TABLE machine_runs IS 'Organization-based RLS enabled. Users can only access data from their Clerk organization.';
COMMENT ON TABLE individual_bags IS 'Organization-based RLS enabled. Access inherited from parent machine_run organization.';
COMMENT ON TABLE cross_checks IS 'Organization-based RLS enabled. Users can only access data from their Clerk organization.';
