import { createClient } from '@supabase/supabase-js';

// Supabase configuration from environment variables
// Set these in .env.local for development or in Vercel Environment Variables for production
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://bjaqorctnozmvmahhncs.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJqYXFvcmN0bm96bXZtYWhobmNzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMxMjU3MjcsImV4cCI6MjA3ODcwMTcyN30.ikMB1mEiaHPHWKroHzgPl1lMD9pnUEbg2NIglwNgLYM';
const SUPABASE_SERVICE_KEY = import.meta.env.VITE_SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJqYXFvcmN0bm96bXZtYWhobmNzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzEyNTcyNywiZXhwIjoyMDc4NzAxNzI3fQ.mBHnjf038mFSTY4nPLhZ8ziqEJAunkhgKHUV7rZB4_Y';

// Log environment status (helpful for debugging)
console.log('Supabase Environment Check:', {
  url: SUPABASE_URL ? '✓ Loaded' : '✗ Missing',
  anonKey: SUPABASE_ANON_KEY ? '✓ Loaded' : '✗ Missing',
  serviceKey: SUPABASE_SERVICE_KEY ? '✓ Loaded' : '✗ Missing',
});

// Public client for reads (anon key)
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Admin client for writes (service key) - only use in admin panel
export const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Database types
export interface DbParticipant {
  id: string;
  name: string;
  total_steps: number;
  points: number;
  team: string | null;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface DbDailyHistory {
  id: string;
  participant_id: string;
  date: string;
  steps: number;
  created_at: string;
}

export interface DbWildcardResult {
  id: string;
  date: string;
  category: string;
  winner_id: string;
  winner_name: string;
  value: number;
  description: string;
  created_at: string;
}

export interface DbWeeklyMilestone {
  id: string;
  participant_id: string;
  week_start: string;
  week_end: string;
  total_steps: number;
  achieved_70k: boolean;
  created_at: string;
}

export interface DbChallengeConfig {
  id: string;
  key: string;
  value: any;
  updated_at: string;
}
