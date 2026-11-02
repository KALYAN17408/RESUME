import { create } from 'zustand';
import type { User, Session } from '@supabase/supabase-js';
import type { UserProfile } from '@/types/auth.types';
import { supabase } from '@/lib/supabase/client';
import { getSupabaseEnv } from '@/lib/supabase/env';
import { AuthService } from '@/features/auth/services/authService';

interface AuthStoreState {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;

  initialize: () => Promise<void>;
  setUser: (user: User | null, session: Session | null) => void;
  setProfile: (profile: UserProfile | null) => void;
  setError: (error: string | null) => void;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthStoreState>((set) => ({
  user: null,
  session: null,
  profile: null,
  isLoading: true,
  isInitialized: false,
  error: null,

  initialize: async () => {
    const { isConfigured } = getSupabaseEnv();

    if (!isConfigured) {
      set({
        user: null,
        session: null,
        profile: null,
        isLoading: false,
        isInitialized: true,
        error: null,
      });
      return;
    }

    try {
      set({ isLoading: true, error: null });
      const session = await AuthService.getSession();

      if (session?.user) {
        set({
          user: session.user,
          session,
          isLoading: false,
          isInitialized: true,
        });

        // Background load profile without blocking
        AuthService.getUserProfile(session.user.id).then((profile) => {
          if (profile) set({ profile });
        });
      } else {
        set({
          user: null,
          session: null,
          profile: null,
          isLoading: false,
          isInitialized: true,
        });
      }

      // Subscribe to real-time auth state changes
      supabase.auth.onAuthStateChange(async (event, newSession) => {
        if (event === 'SIGNED_OUT' || !newSession) {
          set({
            user: null,
            session: null,
            profile: null,
            isLoading: false,
          });
        } else if (newSession?.user) {
          set({
            user: newSession.user,
            session: newSession,
            isLoading: false,
          });

          AuthService.getUserProfile(newSession.user.id).then((profile) => {
            if (profile) set({ profile });
          });
        }
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to initialize authentication.';
      set({
        user: null,
        session: null,
        isLoading: false,
        isInitialized: true,
        error: message,
      });
    }
  },

  setUser: (user, session) => set({ user, session }),
  setProfile: (profile) => set({ profile }),
  setError: (error) => set({ error }),

  signOut: async () => {
    try {
      set({ isLoading: true });
      await AuthService.signOut();
      set({
        user: null,
        session: null,
        profile: null,
        isLoading: false,
        error: null,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error signing out.';
      set({ isLoading: false, error: message });
    }
  },
}));
