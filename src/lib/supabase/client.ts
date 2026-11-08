import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';
import { getSupabaseEnv } from './env';
import { browserAuthStorage } from './storage';

let supabaseInstance: SupabaseClient<Database> | null = null;

export function getSupabaseClient(): SupabaseClient<Database> {
  if (supabaseInstance) {
    return supabaseInstance;
  }

  const { supabaseUrl, supabaseAnonKey } = getSupabaseEnv();

  supabaseInstance = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      flowType: 'pkce',
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
      storage: browserAuthStorage,
    },
  });

  return supabaseInstance;
}

export const supabase = getSupabaseClient();
