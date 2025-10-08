-- Migration script to assign existing records to organizations
-- This script helps migrate from user-based to organization-based data isolation

-- IMPORTANT: Before running this migration:
-- 1. Ensure you have a default organization ID ready
-- 2. Update the DEFAULT_ORG_ID variable below with your actual organization ID from Clerk
-- 3. Review and test on a staging environment first

-- Example: Replace 'org_xxxxxxxxxxxxxxxxxxxxx' with your actual Clerk organization ID
DO $$
DECLARE
  DEFAULT_ORG_ID TEXT := 'org_33m8qoYBwwR9Hg46aQPM2roD9nt'; -- UPDATE THIS WITH YOUR ACTUAL ORG ID
  updated_customers INT;
  updated_orders INT;
  updated_machine_runs INT;
  updated_individual_bags INT;
  updated_cross_checks INT;
BEGIN
  -- Validation disabled - org_id is configured
  -- IF DEFAULT_ORG_ID = 'org_xxxxxxxxxxxxxxxxxxxxx' THEN
  --   RAISE EXCEPTION 'Please configure DEFAULT_ORG_ID before running this migration';
  -- END IF;

  -- Update customers table
  UPDATE customers
  SET org_id = DEFAULT_ORG_ID
  WHERE org_id IS NULL;
  GET DIAGNOSTICS updated_customers = ROW_COUNT;

  -- Update orders table
  UPDATE orders
  SET org_id = DEFAULT_ORG_ID
  WHERE org_id IS NULL;
  GET DIAGNOSTICS updated_orders = ROW_COUNT;

  -- Update machine_runs table
  UPDATE machine_runs
  SET org_id = DEFAULT_ORG_ID
  WHERE org_id IS NULL;
  GET DIAGNOSTICS updated_machine_runs = ROW_COUNT;

  -- Update individual_bags table
  UPDATE individual_bags
  SET org_id = DEFAULT_ORG_ID
  WHERE org_id IS NULL;
  GET DIAGNOSTICS updated_individual_bags = ROW_COUNT;

  -- Update cross_checks table
  UPDATE cross_checks
  SET org_id = DEFAULT_ORG_ID
  WHERE org_id IS NULL;
  GET DIAGNOSTICS updated_cross_checks = ROW_COUNT;

  -- Log the results
  RAISE NOTICE 'Migration completed successfully:';
  RAISE NOTICE '  - Customers updated: %', updated_customers;
  RAISE NOTICE '  - Orders updated: %', updated_orders;
  RAISE NOTICE '  - Machine runs updated: %', updated_machine_runs;
  RAISE NOTICE '  - Individual bags updated: %', updated_individual_bags;
  RAISE NOTICE '  - Cross checks updated: %', updated_cross_checks;
  RAISE NOTICE 'All records assigned to organization: %', DEFAULT_ORG_ID;
END $$;

-- After successful migration, make org_id NOT NULL
-- Uncomment these lines after verifying the migration succeeded:

-- ALTER TABLE customers ALTER COLUMN org_id SET NOT NULL;
-- ALTER TABLE orders ALTER COLUMN org_id SET NOT NULL;
-- ALTER TABLE machine_runs ALTER COLUMN org_id SET NOT NULL;
-- ALTER TABLE individual_bags ALTER COLUMN org_id SET NOT NULL;
-- ALTER TABLE cross_checks ALTER COLUMN org_id SET NOT NULL;

-- Add check constraints to ensure org_id is never empty
-- ALTER TABLE customers ADD CONSTRAINT customers_org_id_not_empty CHECK (org_id <> '');
-- ALTER TABLE orders ADD CONSTRAINT orders_org_id_not_empty CHECK (org_id <> '');
-- ALTER TABLE machine_runs ADD CONSTRAINT machine_runs_org_id_not_empty CHECK (org_id <> '');
-- ALTER TABLE individual_bags ADD CONSTRAINT individual_bags_org_id_not_empty CHECK (org_id <> '');
-- ALTER TABLE cross_checks ADD CONSTRAINT cross_checks_org_id_not_empty CHECK (org_id <> '');
