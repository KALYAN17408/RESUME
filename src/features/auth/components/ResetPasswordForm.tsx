import React, { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthService } from '../services/authService';
import { useUIStore } from '@/stores/uiStore';
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/lib/supabase/client';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { Lock, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import { ConfigMissingBanner } from './ConfigMissingBanner';

export const resetPasswordSchema = z
  .object({
    password: z.string().min(8, 'Password must be at least 8 characters long'),
    confirmPassword: z.string().min(1, 'Please confirm your new password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export const ResetPasswordForm: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser } = useAuthStore();
  const { addToast } = useUIStore();

  const [isVerifyingSession, setIsVerifyingSession] = useState(true);
  const [sessionReady, setSessionReady] = useState(false);
  const [sessionError, setSessionError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const verificationAttemptedRef = useRef(false);

  useEffect(() => {
    let isMounted = true;

    if (verificationAttemptedRef.current) {
      return;
    }
    verificationAttemptedRef.current = true;

    const verifyRecoverySession = async () => {
      // 1. Check if user already has an active session
      const existingSession = await AuthService.getSession();
      if (existingSession?.user) {
        if (isMounted) {
          setUser(existingSession.user, existingSession);
          setSessionReady(true);
          setIsVerifyingSession(false);
        }
        return;
      }

      // 2. Check search params for errors redirected from Supabase auth
      const searchParams = new URLSearchParams(location.search);
      const urlError = searchParams.get('error_description') || searchParams.get('error');
      if (urlError) {
        if (isMounted) {
          setSessionError(decodeURIComponent(urlError));
          setIsVerifyingSession(false);
        }
        return;
      }

      // 3. Handle PKCE code exchange (?code=...)
      const code = searchParams.get('code');
      if (code) {
        try {
          const { user: codeUser, session: codeSession } = await AuthService.exchangeCodeForSession(code);
          if (codeSession && codeUser) {
            setUser(codeUser, codeSession);
            if (typeof window !== 'undefined' && window.history?.replaceState) {
              window.history.replaceState({}, document.title, window.location.pathname);
            }
            if (isMounted) {
              setSessionReady(true);
              setIsVerifyingSession(false);
            }
            return;
          }
        } catch (codeErr: unknown) {
          console.warn('PKCE recovery code exchange failed:', codeErr);
          const msg = codeErr instanceof Error ? codeErr.message : 'Invalid or expired recovery code.';
          if (isMounted) {
            setSessionError(msg);
            setIsVerifyingSession(false);
          }
          return;
        }
      }

      // 4. Handle email OTP token hash (?token_hash=...&type=recovery)
      const tokenHash = searchParams.get('token_hash');
      const otpType = searchParams.get('type');
      if (tokenHash && otpType === 'recovery') {
        try {
          const { user: otpUser, session: otpSession } = await AuthService.verifyRecoveryToken(tokenHash);
          if (otpSession && otpUser) {
            setUser(otpUser, otpSession);
            if (typeof window !== 'undefined' && window.history?.replaceState) {
              window.history.replaceState({}, document.title, window.location.pathname);
            }
            if (isMounted) {
              setSessionReady(true);
              setIsVerifyingSession(false);
            }
            return;
          }
        } catch (otpErr: unknown) {
          console.warn('Recovery token verification failed:', otpErr);
          const msg = otpErr instanceof Error ? otpErr.message : 'Invalid or expired recovery link.';
          if (isMounted) {
            setSessionError(msg);
            setIsVerifyingSession(false);
          }
          return;
        }
      }

      // 5. Handle hash fragments (#access_token=...&refresh_token=...)
      if (location.hash) {
        const hashParams = new URLSearchParams(location.hash.replace(/^#/, ''));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');

        if (accessToken && refreshToken) {
          try {
            const { user: hashUser, session: hashSession } = await AuthService.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });
            if (hashSession && hashUser) {
              setUser(hashUser, hashSession);
              if (typeof window !== 'undefined' && window.history?.replaceState) {
                window.history.replaceState({}, document.title, window.location.pathname);
              }
              if (isMounted) {
                setSessionReady(true);
                setIsVerifyingSession(false);
              }
              return;
            }
          } catch (hashErr: unknown) {
            console.warn('Hash session set failed:', hashErr);
          }
        }
      }

      // 6. Listen for real-time auth state events
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(async (event, newSession) => {
        if ((event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') && newSession?.user) {
          subscription.unsubscribe();
          setUser(newSession.user, newSession);
          if (isMounted) {
            setSessionReady(true);
            setIsVerifyingSession(false);
          }
        }
      });

      // 7. Fallback timeout if no tokens or sessions were present
      setTimeout(() => {
        if (isMounted && !sessionReady) {
          subscription.unsubscribe();
          // Check one final time before showing expired notice
          AuthService.getSession().then((finalSession) => {
            if (!isMounted) return;
            if (finalSession?.user) {
              setUser(finalSession.user, finalSession);
              setSessionReady(true);
              setIsVerifyingSession(false);
            } else {
              setSessionError('No active password reset session. Please request a new recovery link.');
              setIsVerifyingSession(false);
            }
          });
        }
      }, 1200);
    };

    verifyRecoverySession();

    return () => {
      isMounted = false;
    };
  }, [location, setUser, sessionReady]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    setFormError(null);
    setIsSubmitting(true);

    try {
      // Pre-flight check: ensure active session exists before updating password
      const currentSession = await AuthService.getSession();
      if (!currentSession?.user) {
        throw new Error('Your reset session has expired. Please request a new password reset email.');
      }

      await AuthService.updatePassword(data.password);
      setIsSuccess(true);
      addToast({
        type: 'success',
        title: 'Password Updated',
        message: 'Your password has been successfully updated. Redirecting to sign in...',
      });

      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 2000);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Could not reset password.';
      setFormError(message);
      addToast({
        type: 'error',
        title: 'Reset Failed',
        message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // State 1: Verification in progress
  if (isVerifyingSession) {
    return (
      <div className="py-8 text-center space-y-4">
        <Spinner size="md" />
        <div className="space-y-1">
          <h3 className="text-sm font-bold text-slate-900">Verifying Recovery Session</h3>
          <p className="text-xs text-slate-500">Checking your password reset security link...</p>
        </div>
      </div>
    );
  }

  // State 2: Success state
  if (isSuccess) {
    return (
      <div className="space-y-6 text-center py-4">
        <div className="mx-auto w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-slate-900">Password Updated!</h3>
          <p className="text-xs text-slate-600 leading-relaxed max-w-sm mx-auto">
            Your password has been successfully changed. You can now use your new credentials to sign in.
          </p>
        </div>
        <div className="pt-2">
          <Link to="/login">
            <Button variant="primary" className="w-full">
              Proceed to Sign In
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // State 3: Session invalid or expired
  if (!sessionReady) {
    return (
      <div className="space-y-6 text-center py-4">
        <div className="mx-auto w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center">
          <AlertCircle className="w-6 h-6" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-slate-900">Reset Link Expired or Invalid</h3>
          <p className="text-xs text-slate-600 leading-relaxed max-w-sm mx-auto">
            {sessionError ||
              'For your security, password reset links can only be used once and expire after a short period. Please request a new recovery link.'}
          </p>
        </div>
        <div className="pt-2 space-y-3">
          <Link to="/forgot-password">
            <Button variant="primary" className="w-full" rightIcon={<ArrowRight className="w-4 h-4" />}>
              Request New Reset Link
            </Button>
          </Link>
          <div>
            <Link
              to="/login"
              className="text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
            >
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // State 4: Valid session ready - render password update form
  return (
    <div className="space-y-6">
      <ConfigMissingBanner />

      {formError && (
        <div className="flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-3 text-left">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <p className="text-xs text-rose-700 leading-relaxed">{formError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="New Password"
          type="password"
          placeholder="At least 8 characters"
          leftIcon={<Lock className="w-4 h-4" />}
          error={errors.password?.message}
          {...register('password')}
        />

        <Input
          label="Confirm New Password"
          type="password"
          placeholder="Re-enter new password"
          leftIcon={<Lock className="w-4 h-4" />}
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />

        <Button
          type="submit"
          variant="primary"
          className="w-full py-3"
          isLoading={isSubmitting}
          rightIcon={<ArrowRight className="w-4 h-4" />}
        >
          Update Password
        </Button>
      </form>
    </div>
  );
};
