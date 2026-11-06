import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthService } from '../services/authService';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Mail, Lock, User as UserIcon, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import { ConfigMissingBanner } from './ConfigMissingBanner';
import { OAuthButtons } from './OAuthButtons';

export const signupSchema = z
  .object({
    fullName: z.string().min(2, 'Full name must be at least 2 characters long'),
    email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters long'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type SignupFormData = z.infer<typeof signupSchema>;

export const SignupForm: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser } = useAuthStore();
  const { addToast } = useUIStore();
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');

  useEffect(() => {
    // Check for OAuth error redirected back from provider or callback
    const searchParams = new URLSearchParams(location.search);
    const errorParam = searchParams.get('error_description') || searchParams.get('error');
    if (errorParam) {
      setAuthError(decodeURIComponent(errorParam));
    }
  }, [location.search]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: SignupFormData) => {
    setAuthError(null);
    setIsSubmitting(true);

    try {
      const { user, session } = await AuthService.signUp({
        email: data.email,
        password: data.password,
        fullName: data.fullName,
      });

      if (user && !session) {
        // Email confirmation is required by Supabase Auth
        setVerificationSent(true);
        setRegisteredEmail(data.email);
        addToast({
          type: 'info',
          title: 'Verification Email Sent',
          message: 'Please check your inbox to verify your email address before signing in.',
          duration: 6000,
        });
      } else if (session) {
        // Direct auto-confirm or session established
        setUser(user, session);
        addToast({
          type: 'success',
          title: 'Account Created',
          message: 'Welcome to RESUME AI!',
        });
        navigate('/dashboard');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Could not create account.';
      setAuthError(message);
      addToast({
        type: 'error',
        title: 'Registration Error',
        message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (verificationSent) {
    return (
      <div className="space-y-6 text-center py-4">
        <div className="mx-auto w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-slate-900">Verify your email</h3>
          <p className="text-xs text-slate-600 leading-relaxed max-w-sm mx-auto">
            We sent a verification link to <span className="font-semibold text-slate-900">{registeredEmail}</span>. Please click the link to confirm your account and start building.
          </p>
        </div>
        <div className="pt-2">
          <Link to="/login">
            <Button variant="outline" className="w-full">
              Proceed to Sign In
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ConfigMissingBanner />

      {/* Social registration buttons */}
      <OAuthButtons onOAuthError={(err) => setAuthError(err)} source="signup" />

      {/* Divider */}
      <div className="relative flex items-center justify-center">
        <div className="w-full border-t border-slate-200" />
        <span className="absolute bg-white px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          or register with email
        </span>
      </div>

      {authError && (
        <div className="flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-3 text-left">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <p className="text-xs text-rose-700 leading-relaxed">{authError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Full Name"
          type="text"
          placeholder="e.g. Alex Johnson"
          leftIcon={<UserIcon className="w-4 h-4" />}
          error={errors.fullName?.message}
          {...register('fullName')}
        />

        <Input
          label="Email address"
          type="email"
          placeholder="you@company.com"
          leftIcon={<Mail className="w-4 h-4" />}
          error={errors.email?.message}
          {...register('email')}
        />

        <Input
          label="Password"
          type="password"
          placeholder="At least 8 characters"
          leftIcon={<Lock className="w-4 h-4" />}
          error={errors.password?.message}
          {...register('password')}
        />

        <Input
          label="Confirm Password"
          type="password"
          placeholder="Re-enter password"
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
          Create Free Account
        </Button>
      </form>

      <p className="text-center text-xs text-slate-500">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-black hover:underline">
          Sign In
        </Link>
      </p>
    </div>
  );
};
