-- Team Comments Table Migration
-- Run this in Supabase SQL Editor

-- Create team_comments table
CREATE TABLE IF NOT EXISTS public.team_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  team_name TEXT NOT NULL,
  author_name TEXT NOT NULL,
  comment TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_team_comments_team_name ON public.team_comments(team_name);
CREATE INDEX IF NOT EXISTS idx_team_comments_created_at ON public.team_comments(created_at DESC);

-- Enable RLS
ALTER TABLE public.team_comments ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access on team_comments"
  ON public.team_comments
  FOR SELECT
  TO public
  USING (true);

-- Allow public insert
CREATE POLICY "Allow public insert on team_comments"
  ON public.team_comments
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Verify the table was created
SELECT * FROM public.team_comments LIMIT 1;
