-- Reset Teams to Heat Week State
-- Run this in Supabase SQL Editor to clear all team assignments

-- Clear all team assignments from participants
UPDATE public.participants
SET team = NULL
WHERE team IS NOT NULL;

-- Delete the teamsFormed flag from config
DELETE FROM public.challenge_config
WHERE key = 'teamsFormed';

-- Verify teams were cleared
SELECT COUNT(*) as participants_with_teams
FROM public.participants
WHERE team IS NOT NULL;

-- Should return 0 if successful
