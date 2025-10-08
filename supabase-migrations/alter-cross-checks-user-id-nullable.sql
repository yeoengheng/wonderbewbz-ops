-- Make user_id nullable in cross_checks table
-- Run this migration in your Supabase SQL editor

ALTER TABLE cross_checks ALTER COLUMN user_id DROP NOT NULL;
