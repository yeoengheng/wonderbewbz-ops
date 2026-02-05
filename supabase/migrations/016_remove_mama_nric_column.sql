-- Remove the mama_nric column from machine_runs table
-- This column is no longer needed in the application

ALTER TABLE machine_runs DROP COLUMN IF EXISTS mama_nric;
