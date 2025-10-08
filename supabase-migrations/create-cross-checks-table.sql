-- Create cross_checks table for Final Cross Check feature
-- Run this migration in your Supabase SQL editor

CREATE TABLE cross_checks (
  cross_check_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  machine_run_id UUID NOT NULL REFERENCES machine_runs(machine_run_id) ON DELETE CASCADE,
  powder_weight_g NUMERIC NOT NULL,
  quantity INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  user_id TEXT
);

-- Add comments to document the table and columns
COMMENT ON TABLE cross_checks IS 'Cross check entries for powder weight verification';
COMMENT ON COLUMN cross_checks.cross_check_id IS 'Primary key for cross check entry';
COMMENT ON COLUMN cross_checks.machine_run_id IS 'Foreign key to machine_runs table';
COMMENT ON COLUMN cross_checks.powder_weight_g IS 'Individual powder weight in grams';
COMMENT ON COLUMN cross_checks.quantity IS 'Quantity of packages with this powder weight';
COMMENT ON COLUMN cross_checks.created_at IS 'Timestamp when entry was created';
COMMENT ON COLUMN cross_checks.updated_at IS 'Timestamp when entry was last updated';
COMMENT ON COLUMN cross_checks.user_id IS 'User ID who created/modified this entry';

-- Create index on machine_run_id for faster lookups
CREATE INDEX idx_cross_checks_machine_run_id ON cross_checks(machine_run_id);

-- Create index on user_id for multi-tenant queries
CREATE INDEX idx_cross_checks_user_id ON cross_checks(user_id);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_cross_checks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_cross_checks_updated_at
  BEFORE UPDATE ON cross_checks
  FOR EACH ROW
  EXECUTE FUNCTION update_cross_checks_updated_at();

-- Enable Row Level Security
ALTER TABLE cross_checks ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (allow all operations for authenticated users on their own data)
-- Note: Since we're not using RLS for user_id enforcement, we'll handle user_id via application logic

-- Policy for SELECT: Users can view their own cross checks
CREATE POLICY "Users can view own cross checks"
  ON cross_checks
  FOR SELECT
  USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Policy for INSERT: Users can insert their own cross checks
CREATE POLICY "Users can insert own cross checks"
  ON cross_checks
  FOR INSERT
  WITH CHECK (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Policy for UPDATE: Users can update their own cross checks
CREATE POLICY "Users can update own cross checks"
  ON cross_checks
  FOR UPDATE
  USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub')
  WITH CHECK (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Policy for DELETE: Users can delete their own cross checks
CREATE POLICY "Users can delete own cross checks"
  ON cross_checks
  FOR DELETE
  USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');
