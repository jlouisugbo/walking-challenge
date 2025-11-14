-- ============================================
-- Step Challenge Tracker - Supabase Setup
-- Project URL: https://bjaqorctnozmvmahhncs.supabase.co
--
-- INSTRUCTIONS:
-- 1. Go to your Supabase Dashboard
-- 2. Navigate to SQL Editor
-- 3. Create a new query
-- 4. Copy and paste this ENTIRE file
-- 5. Click "Run" to execute
-- 6. Verify tables are created successfully
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. PARTICIPANTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  total_steps BIGINT DEFAULT 0,
  points INTEGER DEFAULT 0,
  team TEXT,
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_participants_name ON participants(name);
CREATE INDEX IF NOT EXISTS idx_participants_points ON participants(points DESC);
CREATE INDEX IF NOT EXISTS idx_participants_total_steps ON participants(total_steps DESC);

-- ============================================
-- 2. DAILY HISTORY TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS daily_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  participant_id UUID NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  steps INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(participant_id, date)
);

-- Indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_daily_history_participant ON daily_history(participant_id);
CREATE INDEX IF NOT EXISTS idx_daily_history_date ON daily_history(date DESC);

-- ============================================
-- 3. WILDCARD RESULTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS wildcard_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL UNIQUE,
  category TEXT NOT NULL,
  winner_id UUID NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  winner_name TEXT NOT NULL,
  value NUMERIC NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for date queries
CREATE INDEX IF NOT EXISTS idx_wildcard_results_date ON wildcard_results(date DESC);

-- ============================================
-- 4. WEEKLY MILESTONES TABLE (70k achievements)
-- ============================================
CREATE TABLE IF NOT EXISTS weekly_milestones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  participant_id UUID NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  week_start DATE NOT NULL,
  week_end DATE NOT NULL,
  total_steps INTEGER NOT NULL,
  achieved_70k BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(participant_id, week_start)
);

-- Index for week queries
CREATE INDEX IF NOT EXISTS idx_weekly_milestones_week ON weekly_milestones(week_start DESC);
CREATE INDEX IF NOT EXISTS idx_weekly_milestones_participant ON weekly_milestones(participant_id);

-- ============================================
-- 5. CHALLENGE CONFIG TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS challenge_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default configuration
INSERT INTO challenge_config (key, value) VALUES
('main_config', '{
  "startDate": "2025-11-10",
  "endDate": "2025-12-10",
  "goalSteps": 300000,
  "milestones": [150000, 225000, 300000],
  "prizes": {
    "first": 40,
    "second": 25,
    "third": 15,
    "teamBonusPerMember": 10
  },
  "teamSize": 3,
  "heatWeekEnabled": true,
  "teamCompetitionEnabled": true
}'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- ============================================
-- 6. ENABLE ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE wildcard_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_config ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 7. RLS POLICIES - Public read, Admin write
-- ============================================

-- Drop existing policies if any
DROP POLICY IF EXISTS "Allow public read access on participants" ON participants;
DROP POLICY IF EXISTS "Allow public read access on daily_history" ON daily_history;
DROP POLICY IF EXISTS "Allow public read access on wildcard_results" ON wildcard_results;
DROP POLICY IF EXISTS "Allow public read access on weekly_milestones" ON weekly_milestones;
DROP POLICY IF EXISTS "Allow public read access on challenge_config" ON challenge_config;

-- Participants: Everyone can read, no one can write (admin uses service key)
CREATE POLICY "Allow public read access on participants"
  ON participants FOR SELECT
  TO anon, authenticated
  USING (true);

-- Daily History: Everyone can read
CREATE POLICY "Allow public read access on daily_history"
  ON daily_history FOR SELECT
  TO anon, authenticated
  USING (true);

-- Wildcard Results: Everyone can read
CREATE POLICY "Allow public read access on wildcard_results"
  ON wildcard_results FOR SELECT
  TO anon, authenticated
  USING (true);

-- Weekly Milestones: Everyone can read
CREATE POLICY "Allow public read access on weekly_milestones"
  ON weekly_milestones FOR SELECT
  TO anon, authenticated
  USING (true);

-- Challenge Config: Everyone can read
CREATE POLICY "Allow public read access on challenge_config"
  ON challenge_config FOR SELECT
  TO anon, authenticated
  USING (true);

-- ============================================
-- 8. HELPER FUNCTIONS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for participants
DROP TRIGGER IF EXISTS update_participants_updated_at ON participants;
CREATE TRIGGER update_participants_updated_at
  BEFORE UPDATE ON participants
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for challenge_config
DROP TRIGGER IF EXISTS update_challenge_config_updated_at ON challenge_config;
CREATE TRIGGER update_challenge_config_updated_at
  BEFORE UPDATE ON challenge_config
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 9. HELPER VIEWS
-- ============================================

-- View for participant rankings with calculated fields
CREATE OR REPLACE VIEW participant_rankings AS
SELECT
  p.*,
  ROW_NUMBER() OVER (ORDER BY p.total_steps DESC) as rank,
  COALESCE(
    (SELECT SUM(dh.steps) FROM daily_history dh WHERE dh.participant_id = p.id),
    0
  ) as verified_total_steps,
  COALESCE(
    (SELECT COUNT(*) FROM daily_history dh WHERE dh.participant_id = p.id),
    0
  ) as days_recorded
FROM participants p
ORDER BY p.total_steps DESC;

-- View for current week milestones
CREATE OR REPLACE VIEW current_week_progress AS
SELECT
  p.id,
  p.name,
  COALESCE(SUM(dh.steps), 0) as week_steps,
  CASE WHEN COALESCE(SUM(dh.steps), 0) >= 70000 THEN true ELSE false END as achieved_70k
FROM participants p
LEFT JOIN daily_history dh ON p.id = dh.participant_id
WHERE dh.date >= DATE_TRUNC('week', CURRENT_DATE)
  AND dh.date < DATE_TRUNC('week', CURRENT_DATE) + INTERVAL '7 days'
GROUP BY p.id, p.name;

-- ============================================
-- 10. GRANT PERMISSIONS
-- ============================================

-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Grant select on all tables
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon, authenticated;

-- Grant select on all sequences
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- ============================================
-- SETUP COMPLETE!
-- ============================================

-- Verify setup
SELECT 'Setup complete! Tables created:' as message;
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_type = 'BASE TABLE'
AND table_name NOT LIKE 'pg_%'
AND table_name NOT LIKE 'sql_%'
ORDER BY table_name;
