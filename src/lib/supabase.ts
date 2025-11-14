import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const SUPABASE_URL = 'https://bjaqorctnozmvmahhncs.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_Y8ya5T4DMHZDaSfb6MMNfQ_0URVb33B';
const SUPABASE_SERVICE_KEY = 'sb_secret_2MmQFfIyDjubhnhGRDCHvA_G-v9E6Gn';

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
