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

  it('guarantees that anonKey has valid 3-part JWT structure and is not truncated with dots', () => {
    const config = getSupabaseEnv();
    expect(config.supabaseAnonKey).not.toContain('...');
    expect(config.supabaseAnonKey.split('.').length).toBe(3);
    expect(config.supabaseUrl).toMatch(/^https:\/\//);
  });
});
