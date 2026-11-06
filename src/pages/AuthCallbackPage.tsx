import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/lib/supabase/client';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import { AuthService } from '@/features/auth/services/authService';
import { Spinner } from '@/components/ui/Spinner';
import { Sparkles, AlertCircle } from 'lucide-react';

export const AuthCallbackPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser, setProfile } = useAuthStore();
  const { addToast } = useUIStore();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const processOAuthCallback = async () => {
      // 1. Check for error parameters in query string or URL hash
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

        if (isMounted) {
          setErrorMessage(readableMessage);
          addToast({
            type: 'error',
            title: 'OAuth Authentication Failed',
            message: readableMessage,
          });
        }

        setTimeout(() => {
          if (isMounted) {
            navigate(`/login?error=${encodeURIComponent(readableMessage)}`, { replace: true });
          }
        }, 1200);
        return;
      }

      // 2. Check for active session established by PKCE exchange or hash detection
      try {
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) {
          throw sessionError;
        }

        if (session?.user) {
          if (isMounted) {
            setUser(session.user, session);
            addToast({
              type: 'success',
              title: 'Signed In Successfully',
              message: 'Welcome to your RESUME AI career workspace!',
            });

            // Fetch and set profile in background
            AuthService.getUserProfile(session.user.id).then((profile) => {
              if (profile && isMounted) setProfile(profile);
            });

            navigate('/dashboard', { replace: true });
          }
          return;
        }

        // 3. Fallback: subscribe to onAuthStateChange in case token exchange is in-flight
        const {
          data: { subscription },
        } = supabase.auth.onAuthStateChange(async (event, newSession) => {
          if (event === 'SIGNED_IN' && newSession?.user) {
            subscription.unsubscribe();
            if (isMounted) {
              setUser(newSession.user, newSession);
              AuthService.getUserProfile(newSession.user.id).then((profile) => {
                if (profile && isMounted) setProfile(profile);
              });
              addToast({
                type: 'success',
                title: 'Signed In Successfully',
                message: 'Welcome to RESUME AI!',
              });
              navigate('/dashboard', { replace: true });
            }
          }
        });

        // 4. Timeout safety guard
        const timeoutId = setTimeout(() => {
          subscription.unsubscribe();
          if (isMounted) {
            const timeoutMsg = 'Authentication session could not be established. Please try again.';
            setErrorMessage(timeoutMsg);
            navigate(`/login?error=${encodeURIComponent(timeoutMsg)}`, { replace: true });
          }
        }, 6000);

        return () => {
          subscription.unsubscribe();
          clearTimeout(timeoutId);
        };
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to finalize OAuth login.';
        if (isMounted) {
          setErrorMessage(message);
          addToast({
            type: 'error',
            title: 'Authentication Error',
            message,
          });
          navigate(`/login?error=${encodeURIComponent(message)}`, { replace: true });
        }
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
