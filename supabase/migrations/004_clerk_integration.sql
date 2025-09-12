-- Update existing tables to use Clerk JWT integration
-- Add user_id columns that default to Clerk user ID from JWT token

-- Add user_id columns to existing tables
ALTER TABLE customers ADD COLUMN user_id TEXT NOT NULL DEFAULT auth.jwt()->>'sub';
ALTER TABLE orders ADD COLUMN user_id TEXT NOT NULL DEFAULT auth.jwt()->>'sub';
ALTER TABLE machine_runs ADD COLUMN user_id TEXT NOT NULL DEFAULT auth.jwt()->>'sub';
ALTER TABLE individual_bags ADD COLUMN user_id TEXT NOT NULL DEFAULT auth.jwt()->>'sub';

-- Enable RLS on all tables
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE machine_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE individual_bags ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for CUSTOMERS table
CREATE POLICY "Users can view their own customers"
ON "public"."customers"
FOR SELECT
TO authenticated
USING (
  ((SELECT auth.jwt()->>'sub') = (user_id)::text)
);

CREATE POLICY "Users can insert their own customers"
ON "public"."customers"
FOR INSERT
TO authenticated
WITH CHECK (
  ((SELECT auth.jwt()->>'sub') = (user_id)::text)
);

CREATE POLICY "Users can update their own customers"
ON "public"."customers"
FOR UPDATE
TO authenticated
USING (
  ((SELECT auth.jwt()->>'sub') = (user_id)::text)
);

-- Create RLS policies for ORDERS table
CREATE POLICY "Users can view their own orders"
ON "public"."orders"
FOR SELECT
TO authenticated
USING (
  ((SELECT auth.jwt()->>'sub') = (user_id)::text)
);

CREATE POLICY "Users can insert their own orders"
ON "public"."orders"
FOR INSERT
TO authenticated
WITH CHECK (
  ((SELECT auth.jwt()->>'sub') = (user_id)::text)
);

CREATE POLICY "Users can update their own orders"
ON "public"."orders"
FOR UPDATE
TO authenticated
USING (
  ((SELECT auth.jwt()->>'sub') = (user_id)::text)
);

-- Create RLS policies for MACHINE_RUNS table
CREATE POLICY "Users can view their own machine runs"
ON "public"."machine_runs"
FOR SELECT
TO authenticated
USING (
  ((SELECT auth.jwt()->>'sub') = (user_id)::text)
);

CREATE POLICY "Users can insert their own machine runs"
ON "public"."machine_runs"
FOR INSERT
TO authenticated
WITH CHECK (
  ((SELECT auth.jwt()->>'sub') = (user_id)::text)
);

CREATE POLICY "Users can update their own machine runs"
ON "public"."machine_runs"
FOR UPDATE
TO authenticated
USING (
  ((SELECT auth.jwt()->>'sub') = (user_id)::text)
);

-- Create RLS policies for INDIVIDUAL_BAGS table
-- Note: Bags inherit access from their machine run's user
CREATE POLICY "Users can view bags from their machine runs"
ON "public"."individual_bags"
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM machine_runs 
    WHERE machine_runs.machine_run_id = individual_bags.machine_run_id 
    AND machine_runs.user_id = (SELECT auth.jwt()->>'sub')
  )
);

CREATE POLICY "Users can insert bags to their machine runs"
ON "public"."individual_bags"
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM machine_runs 
    WHERE machine_runs.machine_run_id = individual_bags.machine_run_id 
    AND machine_runs.user_id = (SELECT auth.jwt()->>'sub')
  )
);

CREATE POLICY "Users can update bags from their machine runs"
ON "public"."individual_bags"
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM machine_runs 
    WHERE machine_runs.machine_run_id = individual_bags.machine_run_id 
    AND machine_runs.user_id = (SELECT auth.jwt()->>'sub')
  )
);

-- Add indexes for user_id columns
CREATE INDEX idx_customers_user_id ON customers(user_id);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_machine_runs_user_id ON machine_runs(user_id);

-- Grant necessary permissions
GRANT ALL ON customers TO authenticated;
GRANT ALL ON orders TO authenticated;
GRANT ALL ON machine_runs TO authenticated;
GRANT ALL ON individual_bags TO authenticated;