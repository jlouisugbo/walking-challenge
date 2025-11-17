-- ============================================
-- Row Level Security Policies for All Tables
-- Run this in Supabase SQL Editor
-- ============================================

-- ============================================
-- PARTICIPANTS TABLE
-- ============================================

-- Enable RLS
ALTER TABLE public.participants ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Allow public read access on participants" ON public.participants;
DROP POLICY IF EXISTS "Allow public insert on participants" ON public.participants;
DROP POLICY IF EXISTS "Allow public update on participants" ON public.participants;
DROP POLICY IF EXISTS "Allow public delete on participants" ON public.participants;

-- Allow anyone to read participants
CREATE POLICY "Allow public read access on participants"
  ON public.participants
  FOR SELECT
  TO public
  USING (true);

-- Allow anyone to insert participants
CREATE POLICY "Allow public insert on participants"
  ON public.participants
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Allow anyone to update participants
CREATE POLICY "Allow public update on participants"
  ON public.participants
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

-- Allow anyone to delete participants
CREATE POLICY "Allow public delete on participants"
  ON public.participants
  FOR DELETE
  TO public
  USING (true);

-- ============================================
-- DAILY_HISTORY TABLE
-- ============================================

-- Enable RLS
ALTER TABLE public.daily_history ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Allow public read access on daily_history" ON public.daily_history;
DROP POLICY IF EXISTS "Allow public insert on daily_history" ON public.daily_history;
DROP POLICY IF EXISTS "Allow public update on daily_history" ON public.daily_history;
DROP POLICY IF EXISTS "Allow public delete on daily_history" ON public.daily_history;

-- Allow anyone to read daily history
CREATE POLICY "Allow public read access on daily_history"
  ON public.daily_history
  FOR SELECT
  TO public
  USING (true);

-- Allow anyone to insert daily history
CREATE POLICY "Allow public insert on daily_history"
  ON public.daily_history
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Allow anyone to update daily history
CREATE POLICY "Allow public update on daily_history"
  ON public.daily_history
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

-- Allow anyone to delete daily history
CREATE POLICY "Allow public delete on daily_history"
  ON public.daily_history
  FOR DELETE
  TO public
  USING (true);

-- ============================================
-- CHALLENGE_CONFIG TABLE
-- ============================================

-- Enable RLS
ALTER TABLE public.challenge_config ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Allow public read access on challenge_config" ON public.challenge_config;
DROP POLICY IF EXISTS "Allow public insert on challenge_config" ON public.challenge_config;
DROP POLICY IF EXISTS "Allow public update on challenge_config" ON public.challenge_config;
DROP POLICY IF EXISTS "Allow public delete on challenge_config" ON public.challenge_config;

-- Allow anyone to read config
CREATE POLICY "Allow public read access on challenge_config"
  ON public.challenge_config
  FOR SELECT
  TO public
  USING (true);

-- Allow anyone to insert config
CREATE POLICY "Allow public insert on challenge_config"
  ON public.challenge_config
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Allow anyone to update config
CREATE POLICY "Allow public update on challenge_config"
  ON public.challenge_config
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

-- Allow anyone to delete config
CREATE POLICY "Allow public delete on challenge_config"
  ON public.challenge_config
  FOR DELETE
  TO public
  USING (true);

-- ============================================
-- WILDCARD_RESULTS TABLE
-- ============================================

-- Enable RLS
ALTER TABLE public.wildcard_results ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Allow public read access on wildcard_results" ON public.wildcard_results;
DROP POLICY IF EXISTS "Allow public insert on wildcard_results" ON public.wildcard_results;
DROP POLICY IF EXISTS "Allow public update on wildcard_results" ON public.wildcard_results;
DROP POLICY IF EXISTS "Allow public delete on wildcard_results" ON public.wildcard_results;

-- Allow anyone to read wildcard results
CREATE POLICY "Allow public read access on wildcard_results"
  ON public.wildcard_results
  FOR SELECT
  TO public
  USING (true);

-- Allow anyone to insert wildcard results
CREATE POLICY "Allow public insert on wildcard_results"
  ON public.wildcard_results
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Allow anyone to update wildcard results
CREATE POLICY "Allow public update on wildcard_results"
  ON public.wildcard_results
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

-- Allow anyone to delete wildcard results
CREATE POLICY "Allow public delete on wildcard_results"
  ON public.wildcard_results
  FOR DELETE
  TO public
  USING (true);

-- ============================================
-- WEEKLY_MILESTONES TABLE
-- ============================================

-- Enable RLS
ALTER TABLE public.weekly_milestones ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Allow public read access on weekly_milestones" ON public.weekly_milestones;
DROP POLICY IF EXISTS "Allow public insert on weekly_milestones" ON public.weekly_milestones;
DROP POLICY IF EXISTS "Allow public update on weekly_milestones" ON public.weekly_milestones;
DROP POLICY IF EXISTS "Allow public delete on weekly_milestones" ON public.weekly_milestones;

-- Allow anyone to read weekly milestones
CREATE POLICY "Allow public read access on weekly_milestones"
  ON public.weekly_milestones
  FOR SELECT
  TO public
  USING (true);

-- Allow anyone to insert weekly milestones
CREATE POLICY "Allow public insert on weekly_milestones"
  ON public.weekly_milestones
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Allow anyone to update weekly milestones
CREATE POLICY "Allow public update on weekly_milestones"
  ON public.weekly_milestones
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

-- Allow anyone to delete weekly milestones
CREATE POLICY "Allow public delete on weekly_milestones"
  ON public.weekly_milestones
  FOR DELETE
  TO public
  USING (true);

-- ============================================
-- TEAMS TABLE (update existing policies)
-- ============================================

-- Enable RLS (should already be enabled)
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Allow public read access on teams" ON public.teams;
DROP POLICY IF EXISTS "Allow authenticated insert on teams" ON public.teams;
DROP POLICY IF EXISTS "Allow authenticated update on teams" ON public.teams;
DROP POLICY IF EXISTS "Allow authenticated delete on teams" ON public.teams;

-- Allow anyone to read teams
CREATE POLICY "Allow public read access on teams"
  ON public.teams
  FOR SELECT
  TO public
  USING (true);

-- Allow anyone to insert teams
CREATE POLICY "Allow public insert on teams"
  ON public.teams
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Allow anyone to update teams
CREATE POLICY "Allow public update on teams"
  ON public.teams
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

-- Allow anyone to delete teams
CREATE POLICY "Allow public delete on teams"
  ON public.teams
  FOR DELETE
  TO public
  USING (true);

-- ============================================
-- VERIFY POLICIES
-- ============================================

-- Check all RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
