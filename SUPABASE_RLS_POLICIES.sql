-- Check if RLS is blocking writes
-- Run this in Supabase SQL Editor to see current RLS policies

SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- If you see policies, we need to make sure service_role can write
-- Run these commands to allow service_role to bypass RLS:

-- For participants table
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;

-- Allow public (anon) to read
CREATE POLICY "Allow public read access" ON participants
  FOR SELECT
  TO anon
  USING (true);

-- Allow service_role to do everything (for admin operations)
CREATE POLICY "Allow service_role full access" ON participants
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- For daily_history table
ALTER TABLE daily_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access" ON daily_history
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow service_role full access" ON daily_history
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- For wildcard_results table
ALTER TABLE wildcard_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access" ON wildcard_results
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow service_role full access" ON wildcard_results
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- For weekly_milestones table
ALTER TABLE weekly_milestones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access" ON weekly_milestones
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow service_role full access" ON weekly_milestones
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- For challenge_config table
ALTER TABLE challenge_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access" ON challenge_config
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow service_role full access" ON challenge_config
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
