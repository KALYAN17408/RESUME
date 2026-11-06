import { supabase } from '@/lib/supabase/client';
import { getSupabaseEnv } from '@/lib/supabase/env';
import type { LoginCredentials, SignupCredentials, UserProfile } from '@/types/auth.types';
import type { Session, User } from '@supabase/supabase-js';

export class AuthService {
  private static checkConfigured() {
    const { isConfigured, missingVariables } = getSupabaseEnv();
    if (!isConfigured) {
      throw new Error(
        `Supabase is not configured. Missing environment variables: ${missingVariables.join(', ')}. Please configure .env before attempting authentication.`
      );
    }
  }

  static async signUp({ email, password, fullName }: SignupCredentials): Promise<{ user: User | null; session: Session | null }> {
    this.checkConfigured();

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
        emailRedirectTo: `${window.location.origin}/dashboard`,
      },
    });

    if (error) {
      throw error;
    }

    return { user: data.user, session: data.session };
  }

  static async signInWithPassword({ email, password }: LoginCredentials): Promise<{ user: User; session: Session }> {
    this.checkConfigured();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw error;
    }

    if (!data.user || !data.session) {
      throw new Error('Authentication succeeded but session could not be established.');
    }

    return { user: data.user, session: data.session };
  }

  static async signOut(): Promise<void> {
    const { isConfigured } = getSupabaseEnv();
    if (!isConfigured) {
      return;
    }
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw error;
    }
  }

  static async signInWithOAuth(provider: 'google' | 'github'): Promise<void> {
    this.checkConfigured();

    const redirectTo = `${window.location.origin}/auth/callback`;
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
        skipBrowserRedirect: true,
      },
    });

    if (error) {
      throw error;
    }

    if (data?.url) {
      window.location.assign(data.url);
    }
  }

  static async exchangeCodeForSession(code: string): Promise<{ user: User | null; session: Session | null }> {
    this.checkConfigured();

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      throw error;
    }

    return { user: data.user, session: data.session };
  }

  static async resetPasswordForEmail(email: string): Promise<void> {
    this.checkConfigured();

    const redirectTo = `${window.location.origin}/reset-password`;

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    });

    if (error) {
      throw error;
    }
  }

  static async updatePassword(newPassword: string): Promise<User> {
    this.checkConfigured();

    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      throw error;
    }

    if (!data.user) {
      throw new Error('Password updated but user session was lost.');
    }

    return data.user;
  }

  static async getSession(): Promise<Session | null> {
    const { isConfigured } = getSupabaseEnv();
    if (!isConfigured) {
      return null;
    }
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.warn('getSession error:', error.message);
      return null;
    }
    return data.session;
  }

  static async getUserProfile(userId: string): Promise<UserProfile | null> {
    const { isConfigured } = getSupabaseEnv();
    if (!isConfigured) {
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        // Table may not exist yet in Phase 1 before SQL migrations
        console.warn('Could not fetch profiles table:', error.message);
        return null;
      }

      return data as UserProfile | null;
    } catch {
      return null;
    }
  }
}
