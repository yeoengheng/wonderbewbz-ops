-- Add organization support to all tables
-- This migration adds org_id columns to support multi-tenant data isolation via Clerk Organizations

-- Add org_id column to customers table
ALTER TABLE customers
ADD COLUMN org_id TEXT;

-- Add org_id column to orders table
ALTER TABLE orders
ADD COLUMN org_id TEXT;

-- Add org_id column to machine_runs table
ALTER TABLE machine_runs
ADD COLUMN org_id TEXT;

-- Add org_id column to individual_bags table (inherits from machine_run)
ALTER TABLE individual_bags
ADD COLUMN org_id TEXT;

-- Add org_id column to cross_checks table if it exists
ALTER TABLE cross_checks
ADD COLUMN org_id TEXT;

-- Create indexes on org_id columns for query performance
CREATE INDEX IF NOT EXISTS idx_customers_org_id ON customers(org_id);
CREATE INDEX IF NOT EXISTS idx_orders_org_id ON orders(org_id);
CREATE INDEX IF NOT EXISTS idx_machine_runs_org_id ON machine_runs(org_id);
CREATE INDEX IF NOT EXISTS idx_individual_bags_org_id ON individual_bags(org_id);
CREATE INDEX IF NOT EXISTS idx_cross_checks_org_id ON cross_checks(org_id);

-- Add composite indexes for common query patterns (org_id + other frequently queried columns)
CREATE INDEX IF NOT EXISTS idx_orders_org_status ON orders(org_id, status);
CREATE INDEX IF NOT EXISTS idx_machine_runs_org_status ON machine_runs(org_id, status);

-- Add comments explaining the org_id field
COMMENT ON COLUMN customers.org_id IS 'Clerk organization ID for multi-tenant data isolation';
COMMENT ON COLUMN orders.org_id IS 'Clerk organization ID for multi-tenant data isolation';
COMMENT ON COLUMN machine_runs.org_id IS 'Clerk organization ID for multi-tenant data isolation';
COMMENT ON COLUMN individual_bags.org_id IS 'Clerk organization ID for multi-tenant data isolation';
COMMENT ON COLUMN cross_checks.org_id IS 'Clerk organization ID for multi-tenant data isolation';
