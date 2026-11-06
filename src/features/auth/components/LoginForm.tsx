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
import { Mail, Lock, AlertCircle, ArrowRight } from 'lucide-react';
import { ConfigMissingBanner } from './ConfigMissingBanner';
import { OAuthButtons } from './OAuthButtons';

export const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const LoginForm: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser } = useAuthStore();
  const { addToast } = useUIStore();
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setAuthError(null);
    setIsSubmitting(true);

    try {
      const { user, session } = await AuthService.signInWithPassword(data);
      setUser(user, session);
      addToast({
        type: 'success',
        title: 'Welcome back!',
        message: 'Successfully signed in to RESUME AI.',
      });
      navigate('/dashboard');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Invalid login credentials.';
      setAuthError(message);
      addToast({
        type: 'error',
        title: 'Authentication Failed',
        message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <ConfigMissingBanner />

      {/* Social login buttons */}
      <OAuthButtons onOAuthError={(err) => setAuthError(err)} source="login" />

      {/* Divider */}
      <div className="relative flex items-center justify-center">
        <div className="w-full border-t border-slate-200" />
        <span className="absolute bg-white px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          or email
        </span>
      </div>

      {/* Form error alert */}
      {authError && (
        <div className="flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-3 text-left">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <p className="text-xs text-rose-700 leading-relaxed">{authError}</p>
        </div>
      )}

      {/* Main Email/Password Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Email address"
          type="email"
          placeholder="you@company.com"
          leftIcon={<Mail className="w-4 h-4" />}
          error={errors.email?.message}
          {...register('email')}
        />

        <div className="space-y-1 text-left">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-semibold text-slate-700 tracking-wide uppercase">
              Password
            </label>
            <Link
              to="/forgot-password"
              className="text-xs font-medium text-black hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <Input
            type="password"
            placeholder="••••••••"
            leftIcon={<Lock className="w-4 h-4" />}
            error={errors.password?.message}
            {...register('password')}
          />
        </div>

        <Button
          type="submit"
          variant="primary"
          className="w-full py-3"
          isLoading={isSubmitting}
          rightIcon={<ArrowRight className="w-4 h-4" />}
        >
          Sign In
        </Button>
      </form>

      {/* Footer link to signup */}
      <p className="text-center text-xs text-slate-500">
        Don&apos;t have an account?{' '}
        <Link to="/signup" className="font-semibold text-black hover:underline">
          Create free account
        </Link>
      </p>
    </div>
  );
};
