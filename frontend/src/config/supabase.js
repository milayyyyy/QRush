/**
 * Supabase configuration and client initialization
 */
import { createClient } from '@supabase/supabase-js';

export const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL || 'https://fulmudwgyhzjhoglocrp.supabase.co';
export const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY || '';

export const supabaseConfig = {
  url: SUPABASE_URL,
  anonKey: SUPABASE_ANON_KEY,
  isConfigured: !!SUPABASE_ANON_KEY
};

// Initialize Supabase client
export const supabase = supabaseConfig.isConfigured
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;
