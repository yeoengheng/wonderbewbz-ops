-- Update default value to 'milk_arrived' for new machine runs
-- This must be in a separate migration after the enum values are committed

ALTER TABLE machine_runs ALTER COLUMN status SET DEFAULT 'milk_arrived';

-- Display current enum values to verify
SELECT enumlabel, enumsortorder
FROM pg_enum
WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'machine_run_status')
ORDER BY enumsortorder;
