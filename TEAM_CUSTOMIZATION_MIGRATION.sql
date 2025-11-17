-- Team Customization Migration
-- Run this in your Supabase SQL Editor to add team customization support

-- Create teams table for customization data
CREATE TABLE IF NOT EXISTS public.teams (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  team_name TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#8b5cf6',
  icon TEXT NOT NULL DEFAULT '👥',
  image_url TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;

-- Create policies for teams table
-- Allow public read access
CREATE POLICY "Allow public read access on teams"
  ON public.teams
  FOR SELECT
  TO public
  USING (true);

-- Allow authenticated users to insert/update (admin operations)
CREATE POLICY "Allow authenticated insert on teams"
  ON public.teams
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated update on teams"
  ON public.teams
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated delete on teams"
  ON public.teams
  FOR DELETE
  TO authenticated
  USING (true);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_teams_updated_at
  BEFORE UPDATE ON public.teams
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert default team customizations (optional)
INSERT INTO public.teams (team_name, display_name, color, icon, description) VALUES
  ('Team Alpha', 'Team Alpha', '#ef4444', '🔴', 'The first team - bold and strong'),
  ('Team Bravo', 'Team Bravo', '#3b82f6', '🔵', 'Strategic and focused'),
  ('Team Charlie', 'Team Charlie', '#10b981', '🟢', 'Fresh energy and determination'),
  ('Team Delta', 'Team Delta', '#f59e0b', '🟡', 'Bright and innovative'),
  ('Team Echo', 'Team Echo', '#8b5cf6', '🟣', 'United and powerful')
ON CONFLICT (team_name) DO NOTHING;

-- Verify the table was created
SELECT * FROM public.teams;
