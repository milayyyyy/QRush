/**
 * Supabase configuration
 */

export const SUPABASE_URL = 'https://fulmudwgyhzjhoglocrp.supabase.co';
export const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY || '';

export const supabaseConfig = {
  url: SUPABASE_URL,
  anonKey: SUPABASE_ANON_KEY,
  isConfigured: !!SUPABASE_ANON_KEY
};
