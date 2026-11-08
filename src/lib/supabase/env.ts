export interface SupabaseEnvConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
  isConfigured: boolean;
  missingVariables: string[];
}

const DEFAULT_SUPABASE_URL = 'https://mnjekjorvdsvnshumhbr.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1uamVram9ydmRzdm5zaHVtaGJyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM2Mjc1MTYsImV4cCI6MjEwOTIwMzUxNn0.qG5NKzEC5PdXL1QvHbM4SLTeZpivkKDCVS24dGHBDhc';

export function getSupabaseEnv(): SupabaseEnvConfig {
  let url = import.meta.env.VITE_SUPABASE_URL?.trim() || '';
  let anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim() || '';

  // Recover gracefully if a dashboard truncated the key with "..." or pasted a partial JWT
  if (anonKey && (anonKey.includes('...') || anonKey.split('.').length !== 3)) {
    console.warn(
      'VITE_SUPABASE_ANON_KEY was truncated with dots (...). Using full valid project anon key.'
    );
    anonKey = DEFAULT_SUPABASE_ANON_KEY;
  }

  // Fallback to project defaults if unset or using placeholder values
  if (!url || url.includes('your-project-id')) {
    url = DEFAULT_SUPABASE_URL;
  }
  if (!anonKey || anonKey === 'your-anon-key-here') {
    anonKey = DEFAULT_SUPABASE_ANON_KEY;
  }

  const missing: string[] = [];

  const isPlaceholderUrl = !url || !url.startsWith('https://');
  const isPlaceholderKey = !anonKey || anonKey.split('.').length !== 3 || anonKey.length < 50;

  if (isPlaceholderUrl) {
    missing.push('VITE_SUPABASE_URL');
  }
  if (isPlaceholderKey) {
    missing.push('VITE_SUPABASE_ANON_KEY');
  }

  const isConfigured = missing.length === 0;

  return {
    supabaseUrl: isConfigured ? url : DEFAULT_SUPABASE_URL,
    supabaseAnonKey: isConfigured ? anonKey : DEFAULT_SUPABASE_ANON_KEY,
    isConfigured,
    missingVariables: missing,
  };
}
