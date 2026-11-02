import { describe, it, expect } from 'vitest';
import { getSupabaseEnv } from '@/lib/supabase/env';

describe('getSupabaseEnv configuration check', () => {
  it('detects unconfigured or missing environment variables safely without throwing', () => {
    const config = getSupabaseEnv();
    expect(config).toBeDefined();
    expect(typeof config.isConfigured).toBe('boolean');
    expect(Array.isArray(config.missingVariables)).toBe(true);

    if (!config.isConfigured) {
      expect(config.missingVariables.length).toBeGreaterThan(0);
      expect(config.supabaseUrl).toBeDefined();
      expect(config.supabaseAnonKey).toBeDefined();
    }
  });
});
