import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/lib/supabase/client';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import { AuthService } from '@/features/auth/services/authService';
import { Spinner } from '@/components/ui/Spinner';
import { Sparkles, AlertCircle } from 'lucide-react';
import type { Session } from '@supabase/supabase-js';

export const AuthCallbackPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser, setProfile } = useAuthStore();
  const { addToast } = useUIStore();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const isProcessedRef = useRef(false);
  const isFinalizedRef = useRef(false);

  useEffect(() => {
    let isMounted = true;

    // React 18 StrictMode guard to prevent duplicate code exchange
    if (isProcessedRef.current) {
      return;
    }
    isProcessedRef.current = true;

    const finalizeSuccessfulSession = async (session: Session) => {
      // Guard against duplicate invocations from concurrent onAuthStateChange and exchangeCodeForSession
      if (!isMounted || isFinalizedRef.current) return;
      isFinalizedRef.current = true;

      const searchParams = new URLSearchParams(location.search);
      const isRecovery = searchParams.get('type') === 'recovery' || location.search.includes('recovery');
      const nextTarget = searchParams.get('next') || (isRecovery ? '/reset-password' : '/dashboard');

      setUser(session.user, session);

      // If this callback is for password recovery, redirect directly to /reset-password
      if (nextTarget === '/reset-password') {
        if (typeof window !== 'undefined' && window.history?.replaceState) {
          window.history.replaceState({}, document.title, window.location.pathname);
        }
        navigate('/reset-password', { replace: true });
        return;
      }

      addToast({
        type: 'success',
        title: 'Signed In Successfully',
        message: 'Welcome to your RESUME AI career workspace!',
      });

      // Remove sensitive auth query parameters from the browser address bar
      if (typeof window !== 'undefined' && window.history?.replaceState) {
        window.history.replaceState({}, document.title, window.location.pathname);
      }

      // Fetch user profile asynchronously in the background
      try {
        const profile = await AuthService.getUserProfile(session.user.id);
        if (profile && isMounted) {
          setProfile(profile);
        }
      } catch (profileErr) {
        console.warn('Profile fetch after OAuth sign-in deferred:', profileErr);
      }

      navigate('/dashboard', { replace: true });
    };

    const handleFailure = (readableMessage: string) => {
      if (!isMounted) return;
      setErrorMessage(readableMessage);
      addToast({
        type: 'error',
        title: 'OAuth Authentication Failed',
        message: readableMessage,
      });

      setTimeout(() => {
        if (isMounted) {
          navigate(`/login?error=${encodeURIComponent(readableMessage)}`, { replace: true });
        }
      }, 1500);
    };

    const processOAuthCallback = async () => {
      // 1. Inspect searchParams and hashParams for OAuth provider error responses
      const searchParams = new URLSearchParams(location.search);
      const hashParams = new URLSearchParams(location.hash.replace(/^#/, ''));

      const error = searchParams.get('error') || hashParams.get('error');
      const errorDescription =
        searchParams.get('error_description') || hashParams.get('error_description');

      if (error) {
        const readableMessage =
          errorDescription ||
          (error === 'access_denied'
            ? 'Sign-in request was cancelled or denied by the provider.'
            : `Authentication failed: ${error}`);
        handleFailure(readableMessage);
        return;
      }

      const code = searchParams.get('code');

      // 2. Subscribe immediately to onAuthStateChange before executing async calls
      // to capture any event already being emitted by the client's internal initializer
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(async (event, newSession) => {
        if ((event === 'SIGNED_IN' || event === 'INITIAL_SESSION' || event === 'PASSWORD_RECOVERY') && newSession?.user) {
          subscription.unsubscribe();
          await finalizeSuccessfulSession(newSession);
        }
      });

      try {
        // 3. First check if a session is already established (e.g. detectSessionInUrl or existing session)
        const {
          data: { session: existingSession },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) {
          console.warn('getSession returned error on callback mount:', sessionError.message);
        }

        if (existingSession?.user) {
          subscription.unsubscribe();
          await finalizeSuccessfulSession(existingSession);
          return;
        }

        // 4. If code is present, actively exchange it for a session (PKCE exchange)
        if (code) {
          const { data: exchangeData, error: exchangeError } =
            await supabase.auth.exchangeCodeForSession(code);

          if (!exchangeError && exchangeData?.session?.user) {
            subscription.unsubscribe();
            await finalizeSuccessfulSession(exchangeData.session);
            return;
          }

          // If manual exchange returned an error, verify if automatic initializer succeeded in parallel
          const {
            data: { session: postExchangeSession },
          } = await supabase.auth.getSession();

          if (postExchangeSession?.user) {
            subscription.unsubscribe();
            await finalizeSuccessfulSession(postExchangeSession);
            return;
          }

          // Real error occurred during exchange
          subscription.unsubscribe();
          const exchangeFailureMsg =
            exchangeError?.message || 'Authentication session could not be established. Please try again.';
          handleFailure(exchangeFailureMsg);
          return;
        }

        // 5. If neither a session nor an auth code is present, redirect back immediately
        subscription.unsubscribe();
        handleFailure('No authentication session or authorization code found.');
      } catch (err: unknown) {
        subscription.unsubscribe();
        const message = err instanceof Error ? err.message : 'Failed to finalize OAuth sign-in.';
        handleFailure(message);
      }
    };

    processOAuthCallback();

    return () => {
      isMounted = false;
    };
  }, [location, navigate, setUser, setProfile, addToast]);

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-slate-50 p-4">
      <div className="w-full max-w-sm rounded-3xl border border-slate-200 bg-white p-8 shadow-card text-center space-y-4">
        <div className="mx-auto w-12 h-12 rounded-2xl bg-black flex items-center justify-center text-white shadow-md shadow-black/20">
          <Sparkles className="w-6 h-6" />
        </div>

        {errorMessage ? (
          <div className="space-y-3">
            <div className="inline-flex p-2 rounded-full bg-rose-50 text-rose-600">
              <AlertCircle className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Sign-in Incomplete</h3>
            <p className="text-xs text-rose-700 leading-relaxed">{errorMessage}</p>
            <p className="text-[11px] text-slate-400">Redirecting to login...</p>
          </div>
        ) : (
          <div className="space-y-3">
            <Spinner size="md" />
            <h3 className="text-sm font-bold text-slate-900">Completing Secure Sign-In</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Verifying your session and provisioning your career workspace...
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
