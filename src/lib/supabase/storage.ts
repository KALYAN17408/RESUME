import type { SupportedStorage } from '@supabase/supabase-js';

/**
 * Resilient multi-layer storage adapter for Supabase Auth in SPA environments.
 *
 * Persists PKCE code verifiers and auth tokens across:
 * 1. window.localStorage (Primary fast client storage)
 * 2. document.cookie (Resilient across cross-origin OAuth redirects & Safari ITP)
 * 3. window.sessionStorage (Fallback for private windows where localStorage is restricted)
 */
export const browserAuthStorage: SupportedStorage = {
  getItem: (key: string): string | null => {
    if (typeof window === 'undefined') {
      return null;
    }

    // 1. Check localStorage
    try {
      const val = window.localStorage.getItem(key);
      if (val) return val;
    } catch {}

    // 2. Check cookies (handles cross-origin OAuth redirects where localStorage was partitioned)
    try {
      if (typeof document !== 'undefined' && document.cookie) {
        const cookies = document.cookie.split(';');
        for (const cookie of cookies) {
          const [rawKey, rawVal] = cookie.trim().split('=');
          if (rawKey === encodeURIComponent(key) && rawVal) {
            return decodeURIComponent(rawVal);
          }
        }
      }
    } catch {}

    // 3. Check sessionStorage
    try {
      const val = window.sessionStorage.getItem(key);
      if (val) return val;
    } catch {}

    return null;
  },

  setItem: (key: string, value: string): void => {
    if (typeof window === 'undefined') {
      return;
    }

    // 1. Write to localStorage
    try {
      window.localStorage.setItem(key, value);
    } catch {}

    // 2. Write to cookie with SameSite=Lax and Secure
    try {
      if (typeof document !== 'undefined') {
        const isHttps = window.location.protocol === 'https:';
        const secureFlag = isHttps ? '; Secure' : '';
        document.cookie = `${encodeURIComponent(key)}=${encodeURIComponent(value)}; path=/; max-age=3600; SameSite=Lax${secureFlag}`;
      }
    } catch {}

    // 3. Write to sessionStorage
    try {
      window.sessionStorage.setItem(key, value);
    } catch {}
  },

  removeItem: (key: string): void => {
    if (typeof window === 'undefined') {
      return;
    }

    // 1. Remove from localStorage
    try {
      window.localStorage.removeItem(key);
    } catch {}

    // 2. Clear from cookie
    try {
      if (typeof document !== 'undefined') {
        const isHttps = window.location.protocol === 'https:';
        const secureFlag = isHttps ? '; Secure' : '';
        document.cookie = `${encodeURIComponent(key)}=; path=/; max-age=0; SameSite=Lax${secureFlag}`;
      }
    } catch {}

    // 3. Remove from sessionStorage
    try {
      window.sessionStorage.removeItem(key);
    } catch {}
  },
};
