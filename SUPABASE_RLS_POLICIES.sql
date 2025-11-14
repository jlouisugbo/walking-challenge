-- IMPORTANT: This script adds RLS policies that allow service_role to write
-- Run this ENTIRE script in Supabase SQL Editor

-- First, drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Allow public read access on participants" ON participants;
DROP POLICY IF EXISTS "Allow service_role full access on participants" ON participants;
DROP POLICY IF EXISTS "Allow public read access on daily_history" ON daily_history;
DROP POLICY IF EXISTS "Allow service_role full access on daily_history" ON daily_history;
DROP POLICY IF EXISTS "Allow public read access on wildcard_results" ON wildcard_results;
DROP POLICY IF EXISTS "Allow service_role full access on wildcard_results" ON wildcard_results;
DROP POLICY IF EXISTS "Allow public read access on weekly_milestones" ON weekly_milestones;
DROP POLICY IF EXISTS "Allow service_role full access on weekly_milestones" ON weekly_milestones;
DROP POLICY IF EXISTS "Allow public read access on challenge_config" ON challenge_config;
DROP POLICY IF EXISTS "Allow service_role full access on challenge_config" ON challenge_config;

-- For participants table
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;

-- Allow public (anon/authenticated) to read
CREATE POLICY "Allow public read access on participants" ON participants
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Allow service_role to do EVERYTHING (insert, update, delete)
CREATE POLICY "Allow service_role full access on participants" ON participants
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- For daily_history table
ALTER TABLE daily_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access on daily_history" ON daily_history
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow service_role full access on daily_history" ON daily_history
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- For wildcard_results table
ALTER TABLE wildcard_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access on wildcard_results" ON wildcard_results
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow service_role full access on wildcard_results" ON wildcard_results
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- For weekly_milestones table
ALTER TABLE weekly_milestones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access on weekly_milestones" ON weekly_milestones
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow service_role full access on weekly_milestones" ON weekly_milestones
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- For challenge_config table
ALTER TABLE challenge_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access on challenge_config" ON challenge_config
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow service_role full access on challenge_config" ON challenge_config
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Verify policies were created
SELECT schemaname, tablename, policyname, roles, cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
