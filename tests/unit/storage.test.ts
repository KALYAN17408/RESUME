import { describe, it, expect, beforeEach } from 'vitest';
import { browserAuthStorage } from '@/lib/supabase/storage';

describe('browserAuthStorage Hybrid Adapter', () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
    document.cookie = '';
  });

  it('stores and retrieves item from localStorage', () => {
    browserAuthStorage.setItem('test-key', 'test-value-123');
    expect(browserAuthStorage.getItem('test-key')).toBe('test-value-123');
  });

  it('falls back to cookie if localStorage is cleared or fails', () => {
    browserAuthStorage.setItem('verifier-key', 'verifier-secret-999');

    // Wipe localStorage to simulate cross-site storage wipe
    window.localStorage.clear();

    // Should read back from cookie
    expect(browserAuthStorage.getItem('verifier-key')).toBe('verifier-secret-999');
  });

  it('removes item from both localStorage and cookies', () => {
    browserAuthStorage.setItem('temp-key', 'temp-value');
    expect(browserAuthStorage.getItem('temp-key')).toBe('temp-value');

    browserAuthStorage.removeItem('temp-key');
    expect(browserAuthStorage.getItem('temp-key')).toBeNull();
  });
});
