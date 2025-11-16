-- ============================================
-- Team Customization Migration
-- Adds team customization table for enhanced team features
-- ============================================

-- ============================================
-- 1. CREATE TEAMS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  color TEXT DEFAULT '#8b5cf6',
  icon TEXT DEFAULT '👥',
  image_url TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for team name lookups
CREATE INDEX IF NOT EXISTS idx_teams_name ON teams(team_name);

-- ============================================
-- 2. ENABLE RLS ON TEAMS TABLE
-- ============================================
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if any
DROP POLICY IF EXISTS "Allow public read access on teams" ON teams;

-- Everyone can read teams
CREATE POLICY "Allow public read access on teams"
  ON teams FOR SELECT
  TO anon, authenticated
  USING (true);

-- ============================================
-- 3. ADD TRIGGER FOR UPDATED_AT
-- ============================================
DROP TRIGGER IF EXISTS update_teams_updated_at ON teams;
CREATE TRIGGER update_teams_updated_at
  BEFORE UPDATE ON teams
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 4. INSERT DEFAULT TEAMS
-- ============================================
INSERT INTO teams (team_name, display_name, color, icon) VALUES
  ('Team Alpha', 'Team Alpha', '#ef4444', '🔴'),
  ('Team Bravo', 'Team Bravo', '#3b82f6', '🔵'),
  ('Team Charlie', 'Team Charlie', '#10b981', '🟢'),
  ('Team Delta', 'Team Delta', '#f59e0b', '🟡'),
  ('Team Echo', 'Team Echo', '#8b5cf6', '🟣')
ON CONFLICT (team_name) DO NOTHING;

-- ============================================
-- 5. GRANT PERMISSIONS
-- ============================================
GRANT SELECT ON teams TO anon, authenticated;

-- ============================================
-- MIGRATION COMPLETE!
-- ============================================
SELECT 'Team customization migration complete!' as message;
