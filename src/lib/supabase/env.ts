export interface SupabaseEnvConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
  isConfigured: boolean;
  missingVariables: string[];
}

export function getSupabaseEnv(): SupabaseEnvConfig {
  const url = import.meta.env.VITE_SUPABASE_URL?.trim() || '';
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim() || '';

  const missing: string[] = [];

  const isPlaceholderUrl = !url || url.includes('your-project-id') || !url.startsWith('https://');
  const isPlaceholderKey = !anonKey || anonKey === 'your-anon-key-here' || anonKey.length < 20;

  if (isPlaceholderUrl) {
    missing.push('VITE_SUPABASE_URL');
  }
  if (isPlaceholderKey) {
    missing.push('VITE_SUPABASE_ANON_KEY');
  }

  const isConfigured = missing.length === 0;

  return {
    supabaseUrl: isConfigured ? url : 'https://placeholder.supabase.co',
    supabaseAnonKey: isConfigured ? anonKey : 'placeholder-anon-key-with-sufficient-length-for-mock',
    isConfigured,
    missingVariables: missing,
  };
}
