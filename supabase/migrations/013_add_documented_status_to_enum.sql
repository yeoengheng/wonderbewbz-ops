-- Add new enum values to machine_run_status
-- Workflow: milk_arrived → documented → processing → completed
-- Original values: pending, processing, completed, qa_failed, cancelled

-- Add 'milk_arrived' if it doesn't exist (before 'pending')
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum
    WHERE enumlabel = 'milk_arrived'
    AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'machine_run_status')
  ) THEN
    ALTER TYPE machine_run_status ADD VALUE 'milk_arrived' BEFORE 'pending';
  END IF;
END $$;

-- Add 'documented' if it doesn't exist (after 'pending', before 'processing')
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum
    WHERE enumlabel = 'documented'
    AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'machine_run_status')
  ) THEN
    ALTER TYPE machine_run_status ADD VALUE 'documented' AFTER 'pending';
  END IF;
END $$;
