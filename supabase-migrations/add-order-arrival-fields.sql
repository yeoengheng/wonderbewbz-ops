-- Add arrival and visual check fields to orders table
-- Run this migration in your Supabase SQL editor

ALTER TABLE orders
ADD COLUMN arrival_temp NUMERIC,
ADD COLUMN arrival_weight NUMERIC,
ADD COLUMN visual_check TEXT CHECK (visual_check IS NULL OR visual_check IN ('passed', 'flagged')),
ADD COLUMN visual_check_remarks TEXT;

-- Add comments to document the columns
COMMENT ON COLUMN orders.arrival_temp IS 'Temperature of the order upon arrival in Celsius';
COMMENT ON COLUMN orders.arrival_weight IS 'Weight of the order upon arrival in grams';
COMMENT ON COLUMN orders.visual_check IS 'Visual inspection result: passed or flagged';
COMMENT ON COLUMN orders.visual_check_remarks IS 'Remarks for flagged visual checks';
