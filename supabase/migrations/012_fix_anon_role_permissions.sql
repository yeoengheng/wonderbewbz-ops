-- Fix RLS policies to work with anon role (used by client with JWT)
-- The anon key with JWT should have the same permissions as authenticated role

-- Grant table-level permissions to anon role
GRANT SELECT, INSERT, UPDATE, DELETE ON customers TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON orders TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON machine_runs TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON individual_bags TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON cross_checks TO anon;

-- Update all policies to also apply to anon role with JWT
-- CUSTOMERS
DROP POLICY IF EXISTS "Organizations can view their own customers" ON customers;
DROP POLICY IF EXISTS "Organizations can insert their own customers" ON customers;
DROP POLICY IF EXISTS "Organizations can update their own customers" ON customers;
DROP POLICY IF EXISTS "Organizations can delete their own customers" ON customers;

CREATE POLICY "Organizations can view their own customers"
ON customers FOR SELECT
TO authenticated, anon
USING (org_id = public.get_current_org_id());

CREATE POLICY "Organizations can insert their own customers"
ON customers FOR INSERT
TO authenticated, anon
WITH CHECK (org_id = public.get_current_org_id());

CREATE POLICY "Organizations can update their own customers"
ON customers FOR UPDATE
TO authenticated, anon
USING (org_id = public.get_current_org_id())
WITH CHECK (org_id = public.get_current_org_id());

CREATE POLICY "Organizations can delete their own customers"
ON customers FOR DELETE
TO authenticated, anon
USING (org_id = public.get_current_org_id());

-- ORDERS
DROP POLICY IF EXISTS "Organizations can view their own orders" ON orders;
DROP POLICY IF EXISTS "Organizations can insert their own orders" ON orders;
DROP POLICY IF EXISTS "Organizations can update their own orders" ON orders;
DROP POLICY IF EXISTS "Organizations can delete their own orders" ON orders;

CREATE POLICY "Organizations can view their own orders"
ON orders FOR SELECT
TO authenticated, anon
USING (org_id = public.get_current_org_id());

CREATE POLICY "Organizations can insert their own orders"
ON orders FOR INSERT
TO authenticated, anon
WITH CHECK (org_id = public.get_current_org_id());

CREATE POLICY "Organizations can update their own orders"
ON orders FOR UPDATE
TO authenticated, anon
USING (org_id = public.get_current_org_id())
WITH CHECK (org_id = public.get_current_org_id());

CREATE POLICY "Organizations can delete their own orders"
ON orders FOR DELETE
TO authenticated, anon
USING (org_id = public.get_current_org_id());

-- MACHINE_RUNS
DROP POLICY IF EXISTS "Organizations can view their own machine runs" ON machine_runs;
DROP POLICY IF EXISTS "Organizations can insert their own machine runs" ON machine_runs;
DROP POLICY IF EXISTS "Organizations can update their own machine runs" ON machine_runs;
DROP POLICY IF EXISTS "Organizations can delete their own machine runs" ON machine_runs;

CREATE POLICY "Organizations can view their own machine runs"
ON machine_runs FOR SELECT
TO authenticated, anon
USING (org_id = public.get_current_org_id());

CREATE POLICY "Organizations can insert their own machine runs"
ON machine_runs FOR INSERT
TO authenticated, anon
WITH CHECK (org_id = public.get_current_org_id());

CREATE POLICY "Organizations can update their own machine runs"
ON machine_runs FOR UPDATE
TO authenticated, anon
USING (org_id = public.get_current_org_id())
WITH CHECK (org_id = public.get_current_org_id());

CREATE POLICY "Organizations can delete their own machine runs"
ON machine_runs FOR DELETE
TO authenticated, anon
USING (org_id = public.get_current_org_id());

-- INDIVIDUAL_BAGS
DROP POLICY IF EXISTS "Organizations can view bags from their machine runs" ON individual_bags;
DROP POLICY IF EXISTS "Organizations can insert bags to their machine runs" ON individual_bags;
DROP POLICY IF EXISTS "Organizations can update bags from their machine runs" ON individual_bags;
DROP POLICY IF EXISTS "Organizations can delete bags from their machine runs" ON individual_bags;

CREATE POLICY "Organizations can view bags from their machine runs"
ON individual_bags FOR SELECT
TO authenticated, anon
USING (
  EXISTS (
    SELECT 1 FROM machine_runs
    WHERE machine_runs.machine_run_id = individual_bags.machine_run_id
    AND machine_runs.org_id = public.get_current_org_id()
  )
);

CREATE POLICY "Organizations can insert bags to their machine runs"
ON individual_bags FOR INSERT
TO authenticated, anon
WITH CHECK (
  EXISTS (
    SELECT 1 FROM machine_runs
    WHERE machine_runs.machine_run_id = individual_bags.machine_run_id
    AND machine_runs.org_id = public.get_current_org_id()
  )
);

CREATE POLICY "Organizations can update bags from their machine runs"
ON individual_bags FOR UPDATE
TO authenticated, anon
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
ON individual_bags FOR DELETE
TO authenticated, anon
USING (
  EXISTS (
    SELECT 1 FROM machine_runs
    WHERE machine_runs.machine_run_id = individual_bags.machine_run_id
    AND machine_runs.org_id = public.get_current_org_id()
  )
);

-- CROSS_CHECKS
DROP POLICY IF EXISTS "Organizations can view their own cross checks" ON cross_checks;
DROP POLICY IF EXISTS "Organizations can insert their own cross checks" ON cross_checks;
DROP POLICY IF EXISTS "Organizations can update their own cross checks" ON cross_checks;
DROP POLICY IF EXISTS "Organizations can delete their own cross checks" ON cross_checks;

CREATE POLICY "Organizations can view their own cross checks"
ON cross_checks FOR SELECT
TO authenticated, anon
USING (org_id = public.get_current_org_id());

CREATE POLICY "Organizations can insert their own cross checks"
ON cross_checks FOR INSERT
TO authenticated, anon
WITH CHECK (org_id = public.get_current_org_id());

CREATE POLICY "Organizations can update their own cross checks"
ON cross_checks FOR UPDATE
TO authenticated, anon
USING (org_id = public.get_current_org_id())
WITH CHECK (org_id = public.get_current_org_id());

CREATE POLICY "Organizations can delete their own cross checks"
ON cross_checks FOR DELETE
TO authenticated, anon
USING (org_id = public.get_current_org_id());
