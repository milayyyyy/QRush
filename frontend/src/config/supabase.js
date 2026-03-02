/**
 * Supabase configuration and client initialization
 */
import { createClient } from '@supabase/supabase-js';

export const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL || 'https://fulmudwgyhzjhoglocrp.supabase.co';
export const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ1bG11ZHdneWh6amhvZ2xvY3JwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIyNDAwODIsImV4cCI6MjA4NzgxNjA4Mn0.wZebv0iTbqLorZVgyHRY-9x8wjZuNmVPgQSLjb8pK6M';

export const supabaseConfig = {
  url: SUPABASE_URL,
  anonKey: SUPABASE_ANON_KEY,
  isConfigured: !!SUPABASE_ANON_KEY
};

// Initialize Supabase client
export const supabase = supabaseConfig.isConfigured
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;
